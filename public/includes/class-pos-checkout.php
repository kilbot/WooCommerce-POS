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

	/**
	 * Process the order
	 * @return 
	 */
	public function process_order() {

		// abort if there is nothing in the cart
		if ( sizeof( WC()->cart->get_cart() ) == 0 )
			exit;

		// set WOOCOMMERCE_CHECKOUT
		if (!defined( 'WOOCOMMERCE_CHECKOUT')) define( 'WOOCOMMERCE_CHECKOUT', true );

		// 
		add_filter( 'woocommerce_checkout_customer_id', 0 );
		add_filter( 'woocommerce_cart_needs_shipping', '__return_false' );
		add_filter( 'woocommerce_cart_needs_payment', '__return_false' );
		add_filter( 'woocommerce_billing_fields', array( $this, 'pos_remove_required_fields'), 10, 1 );
		add_filter( 'woocommerce_checkout_no_payment_needed_redirect', '__return_false' );

		// 
		$woocommerce_checkout = WC()->checkout();
		$woocommerce_checkout->process_checkout();
	}

	/**
	 * After order has been processed successfully
	 * @param  int $order_id
	 * @param  [type] $posted
	 */
	public function pos_order_processed($order_id, $posted) {
		if(!empty($_POST['pos_receipt']) && !wp_verify_nonce($_POST['woocommerce-pos_receipt'],'woocommerce-pos_receipt')) {
			global $order_id;
			WC()->cart->empty_cart();
			exit;
		} else {
			return;
		}
	}



	/**
	 * Remove required fields so we process cart with out address
	 * @param  array $address_fields
	 * @return array
	 */
	public function pos_remove_required_fields( $address_fields ) {
		$address_fields['billing_first_name']['required'] = false;
		$address_fields['billing_last_name']['required'] = false;
		$address_fields['billing_company']['required'] = false;
		$address_fields['billing_address_1']['required'] = false;
		$address_fields['billing_address_2']['required'] = false;
		$address_fields['billing_city']['required'] = false;
		$address_fields['billing_postcode']['required'] = false;
		$address_fields['billing_country']['required'] = false;
		$address_fields['billing_state']['required'] = false;
		$address_fields['billing_email']['required'] = false;
		$address_fields['billing_phone']['required'] = false;
		return $address_fields;
	}

}