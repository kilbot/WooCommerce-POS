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
	}

}