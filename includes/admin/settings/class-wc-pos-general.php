<?php

/**
 * WP Checkout Settings Class
 *
 * @class    WC_POS_Admin_Settings_General
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_General extends WC_POS_Admin_Settings_Page {

	/**
	 * Each settings tab requires an id and label
	 */
	public function __construct() {
		$this->id    = 'general';
		$this->label = _x( 'General', 'settings tab label', 'woocommerce-pos' );
		$this->data  = get_option( WC_POS_Admin_Settings::$prefix . $this->id );
	}

}