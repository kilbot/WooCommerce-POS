<?php

/**
* WP Checkout Settings Class
*
* @class    WC_POS_Admin_Settings_Checkout
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Admin_Settings_Checkout extends WC_POS_Admin_Settings_Page {

	/**
	 * Each settings tab requires an id and label
	 */
	public function __construct() {
		$this->id    = 'checkout';
		$this->label = _x( 'Checkout', 'Settings tab label', 'woocommerce-pos' );
		$this->data  = get_option( WC_POS_Admin_Settings::$prefix . $this->id );
	}

	protected function load_gateways() {
		$gateways = WC_Payment_Gateways::instance()->payment_gateways;

		$order = $this->data['gateway_order'];
		asort( $order, SORT_NUMERIC );

		// reorder
		foreach( $gateways as $gateway ) {
			$ordered_gateways[ $order[$gateway->id] ] = $gateway;
			$gateway->pos = false;
			apply_filters( 'woocommerce_pos_payment_gateways', $gateway );
		}

		ksort( $ordered_gateways, SORT_NUMERIC );
		return $ordered_gateways;
	}

}