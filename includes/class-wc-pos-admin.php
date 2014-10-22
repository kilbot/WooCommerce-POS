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
		new WC_POS_Admin_Menu();    // add menu items
		new WC_POS_Gateways();      // pos payment gateways

		if( true ) {
			new WC_POS_Admin_Settings();      // add settings pages
		}
	}

	public function enqueue_admin_styles() {

	}

	public function enqueue_admin_scripts() {
		$screen = get_current_screen();

		// js for product page
		if ( in_array( $screen->id, array( 'product' ) ) ) {
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
		$screen = get_current_screen();
		$js_vars = array(
			'adminpage' => $screen->id
		);
		$pos_params = '<script type="text/javascript">var pos_params = ' . json_encode($js_vars) . '</script>';
		echo $pos_params;
	}

}