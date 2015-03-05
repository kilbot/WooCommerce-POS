<?php

/**
 * Orders Class
 * Requires REST API v2
 * 
 * @class 	  WooCommerce_POS_Orders
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Orders {

	/** @var array Contains the raw order data */
	private $data = array();

	/** @var array Contains array of item_id => product_id */
	private $items = array();

	public function __construct() {

		// only effects orders from POS
		if( !WC_POS()->is_pos )
			return; 

		// REST API v2
		add_filter( 'woocommerce_api_create_order_data', array( $this, 'create_order_data'), 10, 2 );
		add_action( 'woocommerce_api_create_order', array( $this, 'create_order'), 10, 2 );
		add_action( 'woocommerce_order_add_product', array( $this, 'order_add_product'), 10, 5 );

		// add payment info to order response
		add_filter( 'woocommerce_api_order_response', array( $this, 'add_receipt_fields' ), 10, 4 );
		
		// payment complete
		add_action( 'woocommerce_payment_complete', array( $this, 'payment_complete' ), 10, 1 );
	}

	/**
	 * Store raw data for use by payment gateways
	 * Payload is not in the right format so $data will be empty
	 * @return array data
	 */
	public function create_order_data( $data, $WC_API_Orders ) {
		
		// get raw data from request body
		$this->data = json_decode(trim(file_get_contents('php://input')), true);
		return $this->data;
	}

	/**
	 * Store $item_ids for $this->add_order_tax()
	 */
	public function order_add_product( $order_id, $item_id, $product, $qty, $args ) {
		$this->items[$item_id] = $product->id;
	}

	/**
	 * Payment processing
	 */
	public function create_order( $order_id, $WC_API_Orders ) {

		// add order tax
		$this->add_order_tax( $order_id );

		// add customer to order
		$customer_id = isset($this->data['customer_id']) ? $this->data['customer_id'] : 0 ;
		if( $customer_id !== 0 ) {
			$this->set_order_addresses( $order_id, $customer_id );
		}
		
		// order meta
		update_post_meta( $order_id, '_order_discount', 	wc_format_decimal( $this->data['order_discount'] ) );
		update_post_meta( $order_id, '_cart_discount', 		wc_format_decimal( $this->data['cart_discount'] ) );
		update_post_meta( $order_id, '_order_tax', 			wc_format_decimal( $this->data['total_tax'] ) );
		update_post_meta( $order_id, '_order_total', 		wc_format_decimal( $this->data['total'] ) );

		// itemized tax totals
		if( isset($this->data['itemized_tax']) ) {
			foreach ( $this->data['itemized_tax'] as $tax ) {
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

		// process payment
		$this->process_payment( $order_id, $customer_id );

	}

	/**
	 * Add Tax for orders
	 */
	private function add_order_tax( $order_id ) {

		// update taxes for each item
		foreach( $this->items as $item_id => $product_id ) {

			// get raw data
			$item = array();
			foreach( $this->data['line_items'] as $line_item ){
				if( $line_item['product_id'] == $product_id )
					$item = $line_item;
			}

			// update line meta
			wc_update_order_item_meta( $item_id, '_line_subtotal',     wc_format_decimal( isset( $item['subtotal'] ) ? $item['subtotal'] : 0 ) );
			wc_update_order_item_meta( $item_id, '_line_total',        wc_format_decimal( isset( $item['total'] ) ? $item['total'] : 0 ) );
			wc_update_order_item_meta( $item_id, '_line_subtotal_tax', wc_format_decimal( isset( $item['subtotal_tax'] ) ? $item['subtotal_tax'] : 0 ) );
			wc_update_order_item_meta( $item_id, '_line_tax',          wc_format_decimal( isset( $item['total_tax'] ) ? $item['total_tax'] : 0 ) );

			// tax data
			// serialization is messing with the float, so I'm converting to string here (?)
			if( isset( $item['tax_data'] ) ) {
				$tax_data             = array();
				$tax_data['total']    = array_map( 'wc_float_to_string', $item['tax_data']['total'] );
				$tax_data['subtotal'] = array_map( 'wc_float_to_string', $item['tax_data']['subtotal'] );
				wc_update_order_item_meta( $item_id, '_line_tax_data', $tax_data );
			}

		}

	}

	/**
	 * Set billing & shipping addresses using customer_id
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
	 * Process payment
	 */
	private function process_payment( $order_id, $customer_id ) {

		$payment_method = isset( $this->data['gateway_data']['payment_method'] ) ? $this->data['gateway_data']['payment_method'] : '' ;

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

		// set up $_POST data
		foreach( $this->data['gateway_data'] as $key => $value) {
			$_POST[$key] = $value;
		}

		$payment_gateway->validate_fields();

		// special cases
		$this->special_cases( $payment_gateway->id );

		$response = $payment_gateway->process_payment( $order_id );

		if($response['result'] == 'success') {

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

		// store response
		foreach( $response as $key => $value ) {
			update_post_meta( $order_id, '_pos_payment_'.$key, $value );
		}

	}

	/**
	 * Add any payment messages to API response
	 * Also add subtotal_tax to receipt which is not included for some reason
	 */
	public function add_receipt_fields( $order_data, $order, $fields, $server ) {

		// add any payment messages
		$order_data['payment_details']['result'] = get_post_meta( $order->id, '_pos_payment_result', true );
		$order_data['payment_details']['message'] = get_post_meta( $order->id, '_pos_payment_messages', true );
		$order_data['payment_details']['redirect'] = get_post_meta( $order->id, '_pos_payment_redirect', true );
		$order_data['payment_details']['redirect_required'] = get_post_meta( $order->id, '_pos_payment_redirect_required', true );

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
	 * 
	 */
	public function payment_complete( $order_id ) {
		// payment has been received so we can remove any payment messages
		if( get_post_meta( $order_id, '_payment_method', true ) !== 'pos_cash'  || 'pos_card' ) {
			delete_post_meta( $order_id, '_pos_payment_message');
		}
	}

	/**
	 * Special cases for payment processing ... :(
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

new WooCommerce_POS_Orders();