<?php

/**
 * Checkout Class
 *
 * Handles the checkout
 * TODO: hash cart and allow payment retries
 * 
 * @class 	  WooCommerce_POS_Checkout
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Checkout {

	/**
	 * Checkout data
	 * @var mixed
	 */
	public $cart_items;
	public $customer_id; 		// the customer ID
	public $posted;
	public $user_id; 			// the cashier ID

	/**
	 * Results of calculations by wc
	 * @var float
	 */
	public $subtotal_ex_tax = 0;
	public $total_ex_tax 	= 0;
	public $subtotal_tax 	= 0;
	public $total_tax 		= 0;
	public $wc_total 		= 0;
	public $cart_discount 	= 0;

	/**
	 * Order data
	 * @var [type]
	 */
	public $order_id;

	/**
	 * init
	 */
	public function __construct() {

		// if there is no cart, there is nothing to process!
		if( empty( $_REQUEST['cart'] ) ) 
			return;
	
		$this->process_checkout_data();

		// remove the New Order admin emails
		add_filter( 'woocommerce_email', array( $this, 'remove_new_order_emails' ), 99 );

		// bump date after stock change
		add_action( 'woocommerce_reduce_order_stock', array( $this, 'stock_modified' ), 10, 1 );

	}

	/**
	 * Process any data that is sent from POS
	 */
	public function process_checkout_data() {

		// process checkout data
		$this->cart_items = $_REQUEST['cart'];

		// default to Guest
		$this->customer_id = isset( $_REQUEST['customer_id'] ) ? absint( $_REQUEST['customer_id'] ) : 0 ;

		// the id of the logged in user
		$this->user_id = get_current_user_id();

		// all other data
		$this->posted['payment_method'] = isset( $_REQUEST['payment_method'] ) ? $_REQUEST['payment_method'] : '' ;
		$this->posted['order_discount'] = isset( $_REQUEST['order_discount'] ) ? $_REQUEST['order_discount'] : 0 ;
		$this->posted['note'] 			= isset( $_REQUEST['note'] ) ? wp_kses_post( trim( stripslashes( $_REQUEST['note'] ) ) ) : '' ;

	}

	/**
	 * Create the new order
	 * based on same function in woocommerce/includes/class-wc-checkout.php
	 * @return {int} $order_id
	 */
	public function create_order() {

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

		$this->order_id = wp_insert_post( $order_data, true );

		// add items to order
		foreach ( $this->cart_items as $item ) {
			$this->add_order_item( $item['id'], $item['qty'], $item['line_total'] );
		}

		// now calculate the taxes
		if( get_option( 'woocommerce_calc_taxes' ) == 'yes' ) {
			$this->calc_line_taxes();
		}

		// calculations are done, add order meta
		$this->add_order_meta();

		// add any order notes
		if( $this->posted['note'] ) {
			$order->add_order_note( $this->posted['note'], false );
		}

		// now process the payment
		$response = $this->process_payment();

		$response['order_id'] = $this->order_id;
		$response['wc_total'] = wc_format_decimal( $this->wc_total, get_option( 'woocommerce_price_num_decimals' ) );

		return $response;
	}

	public function process_payment() {

		// process the payment
		$order_id = $this->order_id;
		$order = new WC_Order( $order_id );

		// some gateways check if a user is signed in, so let's switch to customer
		wp_set_current_user( $this->customer_id );

		// get the enabled payment gateways
		$enabled_gateways = WC_POS()->payment_gateways()->get_payment_gateways();

		// load the gateway
		foreach( $enabled_gateways as $gateway ) {
			if( $this->posted['payment_method'] == $gateway->id ) 
				$payment_gateway = $gateway;
		}

		update_post_meta( $order_id, '_payment_method', $payment_gateway->id );
		update_post_meta( $order_id, '_payment_method_title', $payment_gateway->get_title() );

		// $payment_gateway->validate_fields(); // what is returned?

		// Abort if errors are present
		if ( wc_notice_count( 'error' ) > 0 ) {
			$result = array(
				'result'	=> 'failure',
				'messages' 	=> wc_get_notices( 'error' ),
				'refresh' 	=> false,
				'reload'    => false
			);

			// delete 
			wp_delete_post( $order_id, true );
		} else {
			$result = $payment_gateway->process_payment( $order_id );

			// capture any instructions
			ob_start();
			do_action( 'woocommerce_thankyou_' . $payment_gateway->id, $order_id );
			$result['messages'] = ob_get_contents();
			ob_end_clean();
		}

		return $result;
	}

	/**
	 * [get_customer_details description]
	 * @param  [type] $customer_id  [description]
	 * @param  string $type_to_load [description]
	 * @return [type]               [description]
	 */
	public function get_customer_details( $type_to_load = 'billing' ) {

		$customer_id = $this->customer_id;

		$customer_data = array(
			$type_to_load . '_first_name' => get_user_meta( $customer_id, $type_to_load . '_first_name', true ),
			$type_to_load . '_last_name'  => get_user_meta( $customer_id, $type_to_load . '_last_name', true ),
			$type_to_load . '_company'    => get_user_meta( $customer_id, $type_to_load . '_company', true ),
			$type_to_load . '_address_1'  => get_user_meta( $customer_id, $type_to_load . '_address_1', true ),
			$type_to_load . '_address_2'  => get_user_meta( $customer_id, $type_to_load . '_address_2', true ),
			$type_to_load . '_city'       => get_user_meta( $customer_id, $type_to_load . '_city', true ),
			$type_to_load . '_postcode'   => get_user_meta( $customer_id, $type_to_load . '_postcode', true ),
			$type_to_load . '_country'    => get_user_meta( $customer_id, $type_to_load . '_country', true ),
			$type_to_load . '_state'      => get_user_meta( $customer_id, $type_to_load . '_state', true ),
			$type_to_load . '_email'      => get_user_meta( $customer_id, $type_to_load . '_email', true ),
			$type_to_load . '_phone'      => get_user_meta( $customer_id, $type_to_load . '_phone', true ),
		);

		return array_filter( $customer_data );
	}

	public function add_order_meta() {

		$order_id = $this->order_id;

		// now calculate the final totals & update the post_meta
		$this->total_tax = get_option( 'woocommerce_calc_taxes' ) == 'yes' ? $this->total_tax : 0 ;
		$this->cart_discount = ( $this->subtotal_ex_tax + $this->subtotal_tax ) - ( $this->total_ex_tax + $this->total_tax );
		$this->wc_total = $this->total_ex_tax + $this->total_tax - $this->posted['order_discount'];

		// add standard order meta
		update_post_meta( $order_id, '_order_shipping', 	wc_format_decimal( 0 ) );
		update_post_meta( $order_id, '_order_discount', 	wc_format_decimal( $this->posted['order_discount'] ) );
		update_post_meta( $order_id, '_cart_discount', 		wc_format_decimal( $this->cart_discount ) );
		update_post_meta( $order_id, '_order_tax', 			wc_format_decimal( $this->total_tax ) );
		update_post_meta( $order_id, '_order_shipping_tax', wc_format_decimal( 0 ) );
		update_post_meta( $order_id, '_order_total', 		wc_format_decimal( $this->wc_total, get_option( 'woocommerce_price_num_decimals' ) ) );
		update_post_meta( $order_id, '_order_key', 			'wc_' . apply_filters('woocommerce_generate_order_key', uniqid('order_') ) );
		update_post_meta( $order_id, '_order_currency', 	get_woocommerce_currency() );
		update_post_meta( $order_id, '_prices_include_tax', get_option( 'woocommerce_prices_include_tax' ) );

		// customer details
		update_post_meta( $order_id, '_customer_user', $this->customer_id );
		foreach( $this->get_customer_details() as $key => $value ) {
			update_post_meta( $order_id, '_'.$key, $value );
		}

		// pos meta 
		update_post_meta( $order_id, '_pos', 1 );
		update_post_meta( $order_id, '_pos_user', $this->user_id );
	}

	/**
	 * Add order item
	 * based on same function in woocommerce/includes/class-wc-ajax.php
	 * @param mixed $item_to_add, $qty, $line_total
	 */
	public function add_order_item( $item_to_add, $qty, $line_total ) {
		global $wpdb;

		// Find the item
		if ( ! is_numeric( $item_to_add ) )
			die();

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
		$item_id = wc_add_order_item( $this->order_id, array(
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
	public function calc_line_taxes() {
		global $wpdb;

		// init the tax class and get our order
		$tax 		= new WC_Tax();
		$taxes 		= $tax_rows = $item_taxes = array();
		$order 		= new WC_Order( $this->order_id );
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