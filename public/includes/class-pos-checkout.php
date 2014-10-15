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
	 * init
	 */
	public function __construct() {

		// remove the New Order admin emails
		add_filter( 'woocommerce_email', array( $this, 'remove_new_order_emails' ), 99 );

		// bump date after stock change
		add_action( 'woocommerce_reduce_order_stock', array( $this, 'stock_modified' ), 10, 1 );

		// add payment info to order response
		add_filter( 'woocommerce_api_order_response', array( $this, 'add_receipt_fields' ), 10, 4 );

		// payment complete
		add_action( 'woocommerce_payment_complete', array( $this, 'payment_complete' ), 10, 1 );
		
	}

	/**
	 * Create the new order
	 * based on same function in woocommerce/includes/class-wc-checkout.php
	 * @return {int} $order_id
	 */
	public function create_order() {
		global $wpdb;

		// create empty order
		$order_data = apply_filters( 'woocommerce_new_order_data', array(
			'post_type' 	=> 'shop_order',
			'post_title' 	=> sprintf( __( 'Order &ndash; %s', 'woocommerce' ), strftime( _x( '%b %d, %Y @ %I:%M %p', 'Order date parsed by strftime', 'woocommerce' ) ) ),
			'post_status' 	=> 'publish',
			'ping_status'	=> 'closed',
			'post_excerpt' 	=> isset($_REQUEST['note']) && $_REQUEST['note'] != '' ? $_REQUEST['note'] : '',
			'post_author' 	=> 1,
			'post_password'	=> uniqid( 'order_' )	// Protects the post just in case
		) );

		if( version_compare( WC()->version, '2.2.0' ) >= 0 ) {
			$order_data['post_status'] = 'wc-pending';
		}

		$order_id = wp_insert_post( $order_data, true );

		// set customer details
		$customer_id = isset( $_REQUEST['customer_id'] ) ? absint( $_REQUEST['customer_id'] ) : 0 ;
		update_post_meta( $order_id, '_customer_user', $customer_id );

		if( $customer_id !== 0 ) {
			$this->set_order_addresses( $order_id, $customer_id );
		}

		// set line items
		foreach ( $_REQUEST['line_items'] as $item ) {
			$this->set_line_item( $order_id, $item );
		}

		// add other order meta
		$this->add_order_meta( $order_id );

		// now process the payment
		$gateway_response = $this->process_payment( $order_id, $customer_id );

		// rollback over on fail?
		// if( $gateway_response['result'] === 'success' ) {
		// 	$wpdb->query( 'COMMIT' );
		// } else {
		// 	$wpdb->query( 'ROLLBACK' );
		// }

		// return gateway response
		return $gateway_response;
	}

	/**
	 * Set billing & shipping addresses using customer id
	 * follows same function in woocommerce/includes/api/class-wc-api-orders.php
	 */
	private function set_order_addresses( $order_id, $customer_id ) {

		$address_fields = array(
			'first_name',
			'last_name',
			'company',
			'email',
			'phone',
			'address_1',
			'address_2',
			'city',
			'state',
			'postcode',
			'country',
		);

		$billing_address = $shipping_address = array();

		// billing address
		foreach ( $address_fields as $field ) {
			$value = get_user_meta( $customer_id, 'billing_' . $field, true );
			if( $value ) {
				update_post_meta( $order_id, '_billing_'. $field, $value );
			}
		}

		unset( $address_fields['email'] );
		unset( $address_fields['phone'] );

		// shipping address
		foreach ( $address_fields as $field ) {
			$value = get_user_meta( $customer_id, 'shipping_' . $field, true );
			if( $value ) {
				update_post_meta( $order_id, '_shipping_'. $field, $value );
			}
		}

	}

	/**
	 * Set line item
	 * follows same function in woocommerce/includes/api/class-wc-api-orders.php
	 */
	private function set_line_item( $order_id, $line ) {

		// Find the item
		if ( ! is_numeric( $line['product_id'] ) )
			die();

		$post = get_post( $line['product_id']  );

		if ( ! $post || ( 'product' !== $post->post_type && 'product_variation' !== $post->post_type ) ) {
			die();
		}

		$_product = get_product( $line['product_id'] );

		// Set values
		$item = array();

		$item['product_id']        = $_product->id;
		$item['variation_id']      = isset( $_product->variation_id ) ? $_product->variation_id : '';
		$item['variation_data']    = isset( $_product->variation_data ) ? $_product->variation_data : '';
		$item['name']              = $_product->get_title();
		$item['tax_class']         = $_product->get_tax_class();
		$item['qty']               = isset( $line['quantity'] ) ? $line['quantity'] : 1 ;
		$item['line_subtotal']     = wc_format_decimal( $line['subtotal'] );
		$item['line_subtotal_tax'] = wc_format_decimal( $line['subtotal_tax'] );
		$item['line_total']        = wc_format_decimal( $line['total'] );
		$item['line_tax']          = wc_format_decimal( $line['total_tax'] );

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

			// Since 2.2 _line_tax_data ?
			// wc_add_order_item_meta( $item_id, '_line_tax_data', $tax_data );

			do_action( 'woocommerce_ajax_add_order_item_meta', $item_id, $item );
		}

	}

	/**
	 * Process payment
	 */
	private function process_payment( $order_id, $customer_id ) {

		$payment_method = isset( $_REQUEST['payment_method'] ) ? $_REQUEST['payment_method'] : '' ;

		// some gateways check if a user is signed in, so let's switch to customer
		wp_set_current_user( $customer_id );

		// get the enabled payment gateways
		$enabled_gateways = WC_POS()->payment_gateways()->get_payment_gateways();

		// load the gateway
		foreach( $enabled_gateways as $gateway ) {
			if( $payment_method == $gateway->id ) 
				$payment_gateway = $gateway;
		}

		update_post_meta( $order_id, '_payment_method', $payment_gateway->id );
		update_post_meta( $order_id, '_payment_method_title', $payment_gateway->get_title() );

		$payment_gateway->validate_fields();

		// special cases
		$this->special_cases( $payment_gateway->id );

		$response = $payment_gateway->process_payment( $order_id );

		if($response['result'] == 'success') {

			// add order_id to response
			$response['order_id'] = $order_id;

			// capture any instructions
			ob_start();
			do_action( 'woocommerce_thankyou_' . $payment_gateway->id, $order_id );
			$response['messages'] = ob_get_contents();
			ob_end_clean();

			// check if redirect is needed
			if( isset( $response['redirect'] ) ) {

				// 
				$success_url = wc_get_endpoint_url( 'order-received', $order_id, get_permalink( wc_get_page_id( 'checkout' ) ) );
				$success_frag = parse_url( $success_url );
				
				// 
				$redirect_frag = parse_url( $response['redirect'] );

				if( $success_frag['host'] !== $redirect_frag['host'] ) {
					$response['messages'] = sprintf( __('You are now being redirected offsite to complete the payment.<br><a target="_blank" href="%s" data-redirect="true">Click here</a> if you are not redirected automatically.', 'woocommerce-pos'), $response['redirect'] );
					$response['redirect_required'] = true;
				} elseif( $success_frag['path'] !== $redirect_frag['path'] && $response['messages'] == '' ) {
					$response['messages'] = sprintf( __('You are now being redirected offsite to complete the payment.<br><a target="_blank" href="%s" data-redirect="true">Click here</a> if you are not redirected automatically.', 'woocommerce-pos'), $response['redirect'] );
					$response['redirect_required'] = true;
				}

			}

			// store message for display
			if( $response['messages'] !== '' ) {
				update_post_meta( $order_id, '_pos_payment_message', $response['messages'] );
			}

			// add order status to the response
			$order = new WC_Order( $order_id );
			if( $order->status == 'processing' ) {
				$order->update_status( 'completed', 'POS Transaction completed.' );
			}

		} else {

			// default error message
			$default = array(
				'result'	=> 'failure',
				'messages' 	=> wc_get_notices( 'error' ),
				'refresh' 	=> false,
				'reload'    => false
			);

			// merge with actual response
			if( is_array( $response) ) {
				$response = array_merge($default, $response);
			} else {
				$response = $default;
			}

			// if messages empty give generic response
			if( empty( $response['messages'] ) ) {
				$response['messages'] = __( 'There was an error processing the payment', 'woocommerce-pos');
			}
			
		}

		return $response;
	}

	/**
	 * Order meta
	 */
	private function add_order_meta( $order_id ) {

		// add standard order meta
		update_post_meta( $order_id, '_order_shipping', 	wc_format_decimal( 0 ) );
		update_post_meta( $order_id, '_order_discount', 	wc_format_decimal( $_REQUEST['order_discount'] ) );
		update_post_meta( $order_id, '_cart_discount', 		wc_format_decimal( $_REQUEST['cart_discount'] ) );
		update_post_meta( $order_id, '_order_tax', 			wc_format_decimal( $_REQUEST['total_tax'] ) );
		update_post_meta( $order_id, '_order_shipping_tax', wc_format_decimal( 0 ) );
		update_post_meta( $order_id, '_order_total', 		wc_format_decimal( $_REQUEST['total'] ) );
		update_post_meta( $order_id, '_order_key', 			'wc_' . apply_filters('woocommerce_generate_order_key', uniqid('order_') ) );
		update_post_meta( $order_id, '_order_currency', 	get_woocommerce_currency() );
		// update_post_meta( $order_id, '_prices_include_tax', get_option( 'woocommerce_prices_include_tax' ) );

		// itemized tax totals
		if( isset($_REQUEST['itemized_tax']) ) {
			foreach ( $_REQUEST['itemized_tax'] as $tax ) {
				$code = WC()->cart->tax->get_rate_code( $tax['id'] );
				if ( $code ) {
					// Add tax meta
					$item_id = wc_add_order_item( $order_id, array(
						'order_item_name' => $code,
						'order_item_type' => 'tax'
					) );
					// Add line item meta
					if ( $item_id ) {
						wc_add_order_item_meta( $item_id, 'rate_id', $tax['id'] );
						wc_add_order_item_meta( $item_id, 'label', WC()->cart->tax->get_rate_label( $tax['id'] ) );
						wc_add_order_item_meta( $item_id, 'compound', absint( WC()->cart->tax->is_compound( $tax['id'] ) ? 1 : 0 )  );
						wc_add_order_item_meta( $item_id, 'tax_amount', $tax['total'] );
						wc_add_order_item_meta( $item_id, 'shipping_tax_amount', 0 );
					}
				}
			}
		}

		// pos meta 
		update_post_meta( $order_id, '_pos', 1 );
		update_post_meta( $order_id, '_pos_user', get_current_user_id() );
	}

	/**
	 * Add any payment messages to API response
	 * Also add subtotal_tax to receipt which is not included for some reason
	 */
	public function add_receipt_fields( $order_data, $order, $fields, $server ) {
		if( !WC_POS()->is_pos )
			return $order_data;

		// add any payment messages
		$message = get_post_meta( $order->id, '_pos_payment_message', true );
		if($message) {
			$order_data['payment_details']['message'] = $message;
		}

		// add subtotal_tax
		$subtotal_tax = 0;
		foreach( $order_data['line_items'] as &$item ) {
			$line_subtotal_tax = wc_get_order_item_meta( $item['id'], '_line_subtotal_tax', true );
			$item['subtotal_tax'] = wc_format_decimal( $line_subtotal_tax, 2 );
			$subtotal_tax += $line_subtotal_tax;
		}
		$order_data['subtotal_tax'] = wc_format_decimal( $subtotal_tax, 2 );

		return $order_data;
	}

	/**
	 * Send email receipt
	 */
	public function email_receipt() {
		$response 	= '';
		$order_id 	= isset($_REQUEST['order_id']) ? $_REQUEST['order_id'] : '';
		$email 		= isset($_REQUEST['email']) ? $_REQUEST['email'] : '';

		if( $order_id != '' && $email != '' ) {
			update_post_meta( $order_id, '_billing_email', $email );
			WC()->mailer()->customer_invoice( $order_id );
			$response = array(
				'result' => 'success',
				'message' => __( 'Email sent', 'woocommerce-pos')
			);
		} else {
			$response = array(
				'result' => 'failure',
				'message' => __( 'There was an error sending the email', 'woocommerce-pos')
			);
		}

		return $response;
	}

	/**
	 * Stop WC sending email notifications
	 */
	public function remove_new_order_emails( WC_Emails $wc_emails ) {
		// bail if not pos
		if( ! WC_POS()->is_pos )
			return;

		// CUSTOMER EMAILS
		remove_action('woocommerce_order_status_pending_to_processing_notification', array($wc_emails->emails['WC_Email_Customer_Processing_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_on-hold_notification', array($wc_emails->emails['WC_Email_Customer_Processing_Order'], 'trigger'));
		remove_action('woocommerce_order_status_completed_notification', array($wc_emails->emails['WC_Email_Customer_Completed_Order'], 'trigger'));


		// ADMIN EMAILS
		
		// send 'woocommerce_low_stock_notification'
		// send 'woocommerce_no_stock_notification'
		// send 'woocommerce_product_on_backorder_notification'
		remove_action('woocommerce_order_status_pending_to_processing_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_completed_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_pending_to_on-hold_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_failed_to_processing_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_failed_to_completed_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
		remove_action('woocommerce_order_status_failed_to_on-hold_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));

	}

	/**
	 * 
	 */
	public function payment_complete( $order_id ) {
		// payment has been received so we can remove any payment messages
		if( get_post_meta( $order_id, '_payment_method', true ) !== 'pos_cash'  || 'pos_card' ) {
			delete_post_meta( $order_id, '_pos_payment_message');
		}
	} 

	/**
	 * Bump post_modified & post_modified_gmt
	 * @return [type] [description]
	 */
	public function stock_modified( $order ) {
		
		$post_modified     = current_time( 'mysql' );
		$post_modified_gmt = current_time( 'mysql', 1 );

		foreach ( $order->get_items() as $item ) {

			// TODO: if variable, update the parent?
			$id = isset( $item['variation_id'] ) && is_numeric( $item['variation_id'] ) ? $item['variation_id'] : $item['product_id'] ;

			wp_update_post( array(
				'ID' 				=> $id,
				'post_modified' 	=> $post_modified,
				'post_modified_gmt' => $post_modified_gmt
			));
		}
	}

	/**
	 * Special cases for payment processing ... beware, here be dragons!
	 */
	private function special_cases( $gateway_id ) {
		switch ($gateway_id) {
			case 'braintree':
				$_POST['number'] = $_POST['braintree-cc-number'];
				$_POST['month'] = $_POST['braintree-cc-exp-month'];
				$_POST['year'] = $_POST['braintree-cc-exp-year'];
				$_POST['cvv'] = $_POST['braintree-cc-cvv'];
			break;
		}
	}

}