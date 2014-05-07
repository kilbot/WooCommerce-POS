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
	 * init
	 */
	public function __construct() {

		if ( ! defined( 'WOOCOMMERCE_CHECKOUT' ) ) 
			define( 'WOOCOMMERCE_CHECKOUT', true );


		// filters to bypass woo checks
		// bit of a hack until WC REST API develops
		add_filter( 'woocommerce_checkout_customer_id', 0 );
		add_filter( 'woocommerce_cart_needs_shipping', '__return_false' );
		add_filter( 'woocommerce_cart_needs_payment', '__return_false' );
		add_filter( 'woocommerce_billing_fields', array( $this, 'remove_required_fields') );

		// remove the New Order admin emails 
		add_filter( 'woocommerce_email', array( $this, 'remove_new_order_emails' ), 99 );
	}

	/**
	 * Process the order
	 * @return 
	 */
	public function create_order() {

		// abort if there is nothing in the cart
		if ( sizeof( WC()->cart->get_cart() ) == 0 )
			exit;

		WC()->cart->calculate_totals(); 			// calculate item totals
		$order_id = WC()->checkout->create_order(); // create the order post
		$this->processs_payment( $order_id );		// process payment
		WC()->cart->empty_cart(); 					// empty cart

		// add order meta, eg:
		// update_post_meta( $order_id, 'Cash', $value ) );

		return $order_id;
	}

	function processs_payment( $order_id ) {

		// set up the order
		$order = new WC_Order( $order_id );			
		$order->payment_complete(); 
		$order->update_status( 'completed', 'POS Sale completed' );
		$order->reduce_order_stock();

	}

	/**
	 * Stop WC sending email notifications
	 * @return null 
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
	 * Remove required fields so we process cart with out address
	 * @param  array $address_fields
	 * @return array
	 */
	public function remove_required_fields( $address_fields ) {
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