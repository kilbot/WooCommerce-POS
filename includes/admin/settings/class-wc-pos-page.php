<?php

/**
 * Abstract Settings Page Class
 *
 * @class    WC_POS_Admin_Settings_Page
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

abstract class WC_POS_Admin_Settings_Page {

	public $button = true;

	/**
	 * Output the view file
	 */
	public function output(){
		include 'views/' . $this->id . '.php';
	}

	/**
	 * Bootstrap the settings
	 * @return mixed|string|void
	 */
	public function bootstrap_data() {
		$data = get_option( WC_POS_Admin_Settings::DB_PREFIX . $this->id );
		$data['id'] = $this->id;
		$data['security'] = wp_create_nonce( 'wc-pos-settings' );
		return json_encode( $data );
	}

}