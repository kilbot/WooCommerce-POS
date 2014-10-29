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

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
		add_action( 'admin_print_footer_scripts', array( $this, 'admin_print_footer_scripts' ) );

		$this->init();
	}

	/**
	 * Load admin subclasses
	 */
	private function init() {

		// ajax
		if( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			new WC_POS_AJAX();      // classes only needed for ajax requests

		// wp admin
		} else {
			new WC_POS_Admin_Menu();      // add menu items
			new WC_POS_Admin_Settings();  // add settings pages
		}

	}

	public function enqueue_admin_styles() {

	}

	public function enqueue_admin_scripts() {
		$screen = get_current_screen();

		// js for product page
		if ( false ) {
			wp_enqueue_script(
				WC_POS_PLUGIN_NAME . '-products',
				WC_POS_PLUGIN_URL . 'assets/js/products.min.js',
				array(
					'jquery',
					'backbone',
					'underscore'
				),
				WC_POS_VERSION
			);
		}
	}

	/**
	 *
	 */
	public function admin_print_footer_scripts() {

	}

}