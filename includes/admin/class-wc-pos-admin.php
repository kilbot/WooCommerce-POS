<?php

/**
* WP Admin Class
*
* @class    WC_POS_Admin
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Admin {

	/**
	 * Constructor
	 */
	public function __construct() {

		$this->load_dependencies();

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );

	}

	private function load_dependencies() {

		new WC_POS_Admin_Menu();
	}

	public function enqueue_admin_styles() {

	}

}