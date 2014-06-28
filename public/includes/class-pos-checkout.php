<?php

/**
 * Checkout Class
 *
 * Handles the checkout
 * 
 * @class 	  WooCommerce_POS_Checkout
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Checkout {

	public $subtotal_ex_tax;
	public $total_ex_tax;
	public $subtotal_tax;
	public $total_tax;

	/**
	 * init
	 */
	public function __construct() {

		// remove the New Order admin emails
		add_filter( 'woocommerce_email', array( $this, 'remove_new_order_emails' ), 99 );

		// bump date after stock change
		add_action( 'woocommerce_reduce_order_stock', array( $this, 'stock_modified' ), 10, 1 );

	}

	/**
	 * Create the new order
	 * based on same function in woocommerce/includes/class-wc-checkout.php
	 * @return {int} $order_id
	 */
	public function create_order() {

		// error_log( print_R( $_REQUEST, TRUE ) ); //debug
		if( !isset( $_REQUEST['cart'] ) ) 
			return;

		// create empty order
		$order_data = apply_filters( 'woocommerce_new_order_data', array(
			'post_type' 	=> 'shop_order',
			'post_title' 	=> sprintf( __( 'Order &ndash; %s', 'woocommerce' ), strftime( _x( '%b %d, %Y @ %I:%M %p', 'Order date parsed by strftime', 'woocommerce' ) ) ),
			'post_status' 	=> 'publish',
			'ping_status'	=> 'closed',
			'post_excerpt' 	=> '',
			'post_author' 	=> 1,
			'post_password'	=> uniqid( 'order_' )	// Protects the post just in case
		) );

		$order_id = wp_insert_post( $order_data, true );

		// add items to order
		$total = 0;
		$cart_discount = 0;
		$order_discount = 0;
		$customer_id = 0;
		$note = false;
		foreach ($_REQUEST['cart'] as $key => $item) {
			$this->add_order_item( $order_id, $item['id'], $item['qty'], $item['line_total'] );
		}

		if( isset( $_REQUEST['order_discount'] ) && $_REQUEST['order_discount'] !== '' )
			$order_discount = $_REQUEST['order_discount'];

		if( isset( $_REQUEST['note'] ) && $_REQUEST['note'] !== '' )
			$note = wp_kses_post( trim( stripslashes( $_REQUEST['note'] ) ) );

		if( isset( $_REQUEST['customer_id'] ) && is_numeric( $_REQUEST['customer_id'] ) )
			$customer_id = $_REQUEST['customer_id'];

		// now calculate the taxes
		$this->calc_line_taxes( $order_id );
		$tax_total = get_option( 'woocommerce_calc_taxes' ) == 'yes' ? $this->total_tax : 0 ;

		// now calculate the final totals & update the post_meta
		$cart_discount = ( $this->subtotal_ex_tax + $this->subtotal_tax ) - ( $this->total_ex_tax + $this->total_tax );
		$order_total = $this->total_ex_tax + $this->total_tax - $order_discount;

		update_post_meta( $order_id, '_order_shipping', 		wc_format_decimal( 0 ) );
		update_post_meta( $order_id, '_order_discount', 		wc_format_decimal( $order_discount ) );
		update_post_meta( $order_id, '_cart_discount', 			wc_format_decimal( $cart_discount ) );
		update_post_meta( $order_id, '_order_tax', 				wc_format_decimal( $tax_total ) );
		update_post_meta( $order_id, '_order_shipping_tax', 	wc_format_decimal( 0 ) );
		update_post_meta( $order_id, '_order_total', 			wc_format_decimal( $order_total, get_option( 'woocommerce_price_num_decimals' ) ) );

		update_post_meta( $order_id, '_order_key', 				'wc_' . apply_filters('woocommerce_generate_order_key', uniqid('order_') ) );
		update_post_meta( $order_id, '_customer_user', 			absint( $customer_id ) );
		update_post_meta( $order_id, '_order_currency', 		get_woocommerce_currency() );
		update_post_meta( $order_id, '_prices_include_tax', 	get_option( 'woocommerce_prices_include_tax' ) );

		// now final clean up before we hand off the order_id
		$order = new WC_Order( $order_id );
		$order->payment_complete();                 
		$order->update_status( 'completed', 'POS Transaction completed.' );
		if($note) {
			$order->add_order_note( $note, false );
		}

		$result = array(
			'order' => array(
				'id' => $order_id,
				'total' => wc_format_decimal( $order_total, get_option( 'woocommerce_price_num_decimals' ) )
			)
		);
		return $result;
	}


	/**
	 * Add order item
	 * based on same function in woocommerce/includes/class-wc-ajax.php
	 * @param {int} $order_id, $item_to_add, $qty, $line_total
	 */
	public function add_order_item( $order_id, $item_to_add, $qty, $line_total ) {
		global $wpdb;

		// Find the item
		if ( !is_numeric( $order_id ) || !is_numeric( $item_to_add ) || !is_numeric( $qty ) || !is_numeric( $line_total ) ) {
			die();
		}

		$post = get_post( $item_to_add );

		if ( ! $post || ( 'product' !== $post->post_type && 'product_variation' !== $post->post_type ) ) {
			die();
		}

		$_product = get_product( $post->ID );

		// Set values
		$item = array();

		$item['product_id']        = $_product->id;
		$item['variation_id']      = isset( $_product->variation_id ) ? $_product->variation_id : '';
		$item['variation_data']    = isset( $_product->variation_data ) ? $_product->variation_data : '';
		$item['name']              = $_product->get_title();
		$item['tax_class']         = $_product->get_tax_class();
		$item['qty']               = isset( $qty ) ? $qty : 1 ;
		$item['line_subtotal']     = wc_format_decimal( $item['qty'] * $_product->get_price_excluding_tax() );
		$item['line_subtotal_tax'] = ''; 
		$item['line_total']        = isset( $line_total ) ? $line_total : wc_format_decimal( $item['qty'] * $_product->get_price_excluding_tax() );
		$item['line_tax']          = ''; 

		// Add line item
		$item_id = wc_add_order_item( $order_id, array(
			'order_item_name' 		=> $item['name'],
			'order_item_type' 		=> 'line_item'
		) );

		// Add line item meta
		if ( $item_id ) {
			wc_add_order_item_meta( $item_id, '_qty', $item['qty'] );
			wc_add_order_item_meta( $item_id, '_tax_class', $item['tax_class'] );
			wc_add_order_item_meta( $item_id, '_product_id', $item['product_id'] );
			wc_add_order_item_meta( $item_id, '_variation_id', $item['variation_id'] );
			wc_add_order_item_meta( $item_id, '_line_subtotal', $item['line_subtotal'] );
			wc_add_order_item_meta( $item_id, '_line_subtotal_tax', $item['line_subtotal_tax'] ); 
			wc_add_order_item_meta( $item_id, '_line_total', $item['line_total'] );
			wc_add_order_item_meta( $item_id, '_line_tax', $item['line_tax'] ); 

			// Store variation data in meta
			if ( $item['variation_data'] && is_array( $item['variation_data'] ) ) {
				foreach ( $item['variation_data'] as $key => $value ) {
					wc_add_order_item_meta( $item_id, str_replace( 'attribute_', '', $key ), $value );
				}
			}

			do_action( 'woocommerce_ajax_add_order_item_meta', $item_id, $item );
		}

		$item = apply_filters( 'woocommerce_ajax_order_item', $item, $item_id );

		$this->subtotal_ex_tax += $item['line_subtotal'];
		$this->total_ex_tax += $item['line_total'];

	}


	/**
	 * Calc line tax
	 * based on same function in woocommerce/includes/class-wc-ajax.php
	 * @param {float} total
	 * 
	 */
	public function calc_line_taxes( $order_id ) {
		global $wpdb;

		// init the tax class and get our order
		$tax 		= new WC_Tax();
		$taxes 		= $tax_rows = $item_taxes = array();
		$order 		= new WC_Order( $order_id );
		$items    	= $order->get_items();
		$item_tax 	= 0;

		// calculate tax rates at store base
		// this could be conditional on get_option for stores with more than one location
		$base = get_option( 'woocommerce_default_country' );
		if ( strstr( $base, ':' ) ) {
			list( $country, $state ) = explode( ':', $base );
		} else {
			$country = $base;
			$state = '';
		}
		$tax_rates = $tax->find_rates( array( 'country' => $country, 'state' => $state ) );

		// Calculate sales tax
		if ( sizeof( $items ) > 0 ) {
			foreach( $items as $item_id => $item ) {

				$item_id       = absint( $item_id );
				$line_subtotal = isset( $item['line_subtotal'] ) ? wc_format_decimal( $item['line_subtotal'] ) : 0;
				$line_total    = wc_format_decimal( $item['line_total'] );
				$tax_class     = sanitize_text_field( $item['tax_class'] );
				$product_id    = $order->get_item_meta( $item_id, '_product_id', true );

				if ( ! $item_id || '0' == $tax_class ) {
					continue;
				}

				// Get product details
				if ( get_post_type( $product_id ) == 'product' ) {
					$_product        = get_product( $product_id );
					$item_tax_status = $_product->get_tax_status();
				} else {
					$item_tax_status = 'taxable';
				}

				// Only calc if taxable
				if ( 'taxable' == $item_tax_status ) {

					$tax_rates = $tax->find_rates( array(
						'country'   => $country,
						'state'     => $state,
						'tax_class' => $tax_class
					) );

					$line_subtotal_taxes = $tax->calc_tax( $line_subtotal, $tax_rates, false );
					$line_taxes          = $tax->calc_tax( $line_total, $tax_rates, false );
					$line_subtotal_tax   = array_sum( $line_subtotal_taxes );
					$line_tax            = array_sum( $line_taxes );

					if ( $line_subtotal_tax < 0 ) {
						$line_subtotal_tax = 0;
					}

					if ( $line_tax < 0 ) {
						$line_tax = 0;
					}

					// Add line item meta now
					wc_update_order_item_meta( $item_id, '_line_subtotal_tax', $line_subtotal_tax );
					wc_update_order_item_meta( $item_id, '_line_tax', $line_tax );

					$this->subtotal_tax += $line_subtotal_tax;
					$this->total_tax += $line_tax;

					// Sum the item taxes
					foreach ( array_keys( $taxes + $line_taxes ) as $key ) {
						$taxes[ $key ] = ( isset( $line_taxes[ $key ] ) ? $line_taxes[ $key ] : 0 ) + ( isset( $taxes[ $key ] ) ? $taxes[ $key ] : 0 );
					}
				}

			}
		}

		// Remove old tax rows?
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}woocommerce_order_itemmeta WHERE order_item_id IN ( SELECT order_item_id FROM {$wpdb->prefix}woocommerce_order_items WHERE order_id = %d AND order_item_type = 'tax' )", $order_id ) );
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}woocommerce_order_items WHERE order_id = %d AND order_item_type = 'tax'", $order_id ) );

		// Get tax rates 
		// seems to duplicate $tax->get_rate_code( $key )
		// but it's in the WC code so I'll leave it for now
		$rates = $wpdb->get_results( "SELECT tax_rate_id, tax_rate_country, tax_rate_state, tax_rate_name, tax_rate_priority FROM {$wpdb->prefix}woocommerce_tax_rates ORDER BY tax_rate_name" );

		$tax_codes = array();

		foreach( $rates as $rate ) {
			$code = array();

			$code[] = $rate->tax_rate_country;
			$code[] = $rate->tax_rate_state;
			$code[] = $rate->tax_rate_name ? sanitize_title( $rate->tax_rate_name ) : 'TAX';
			$code[] = absint( $rate->tax_rate_priority );

			$tax_codes[ $rate->tax_rate_id ] = strtoupper( implode( '-', array_filter( $code ) ) );
		}

		foreach ( array_keys( $taxes ) as $key ) {

			$item                        = array();
			$item['rate_id']             = $key;
			$item['name']                = $tax_codes[ $key ];
			$item['label']               = $tax->get_rate_label( $key );
			$item['compound']            = $tax->is_compound( $key ) ? 1 : 0;
			$item['tax_amount']          = wc_format_decimal( isset( $taxes[ $key ] ) ? $taxes[ $key ] : 0 );
			$item['shipping_tax_amount'] = 0;

			if ( ! $item['label'] ) {
				$item['label'] = WC()->countries->tax_or_vat();
			}

			// Add line item
			$item_id = wc_add_order_item( $order_id, array(
				'order_item_name' => $item['name'],
				'order_item_type' => 'tax'
			) );

			// Add line item meta
			if ( $item_id ) {
				wc_add_order_item_meta( $item_id, 'rate_id', $item['rate_id'] );
				wc_add_order_item_meta( $item_id, 'label', $item['label'] );
				wc_add_order_item_meta( $item_id, 'compound', $item['compound'] );
				wc_add_order_item_meta( $item_id, 'tax_amount', $item['tax_amount'] );
				wc_add_order_item_meta( $item_id, 'shipping_tax_amount', $item['shipping_tax_amount'] );
			}

		}

	}

	/**
	 * Stop WC sending email notifications
	 */
	public function remove_new_order_emails( WC_Emails $wc_emails ) {

		// Hooks for sending emails during store events
		
		//' woocommerce_low_stock_notification'
		// 'woocommerce_no_stock_notification'
		// 'woocommerce_product_on_backorder_notification'
		remove_action('woocommerce_order_status_pending_to_processing_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_completed_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_on-hold_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_failed_to_processing_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_failed_to_completed_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_failed_to_on-hold_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_processing_notification', array($wc_emails->emails['WC_Email_Customer_Processing_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_on-hold_notification', array($wc_emails->emails['WC_Email_Customer_Processing_Order'], 'trigger'));
		remove_action('woocommerce_order_status_completed_notification', array($wc_emails->emails['WC_Email_Customer_Completed_Order'], 'trigger'));

	}

	/**
	 * Bump post_modified & post_modified_gmt
	 * @return [type] [description]
	 */
	public function stock_modified( $order ) {
		
		$post_modified     = current_time( 'mysql' );
		$post_modified_gmt = current_time( 'mysql', 1 );

		foreach ( $order->get_items() as $item ) {
			$id = isset( $item['variation_id'] ) && is_numeric( $item['variation_id'] ) ? $item['variation_id'] : $item['product_id'] ;

			wp_update_post( array(
				'ID' 				=> $id,
				'post_modified' 	=> $post_modified,
				'post_modified_gmt' => $post_modified_gmt
			));
		}
	}

}