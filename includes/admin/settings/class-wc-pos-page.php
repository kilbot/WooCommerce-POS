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

	/**
	 * Output the view file
	 */
	public function output(){
		include_once 'views/' . $this->id . '.php';
	}

	/**
	 * Bootstrap the settings
	 * @return mixed|string|void
	 */
	public function bootstrap_data() {
		$defaults = array(
			'id' => $this->id,
			'security' => wp_create_nonce( 'wc-pos-settings' )
		);
		return json_encode( array_merge( $defaults, $this->data ) );
	}

}