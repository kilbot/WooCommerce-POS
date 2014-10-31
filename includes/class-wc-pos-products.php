<?php

/**
 * POS Product Class
 *
 * @class    WC_POS_Products
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Products {

	/**
	 * Constructor
	 */
	public function __construct() {

		$this->init();
	}

	/**
	 * Load Product subclasses
	 */
	private function init() {

		// pos only products
		$settings = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'general' );
		if( isset( $settings['enable_pos_visibility'] ) && $settings['enable_pos_visibility'] ) {
			new WC_POS_Products_Visibility();
		}
	}

}