<?php

/**
 * WP Checkout Settings Class
 *
 * @class    WC_POS_Admin_Settings_General
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_General implements WC_POS_Settings_Interface {

	static public $sections = array();

	public function __construct() {
		$this->id = 'general';
		$this->label = _x( 'General', 'settings tab label', 'woocommerce-pos' );
	}

	public function output() {
		include_once 'views/general.php';
	}

}