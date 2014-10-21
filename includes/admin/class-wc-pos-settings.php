<?php

/**
 * WP Settings Class
 *
 * @class    WC_POS_Settings
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings {

	private $settings = array();

	/**
	 * Constructor
	 */
	public function __construct() {

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		$this->init();
	}

	/**
	 * Load settings subclasses
	 */
	private function init() {
		$settings = array();
		$settings[] = new WC_POS_Admin_Settings_General();
		$settings[] = new WC_POS_Admin_Settings_Checkout();
		$this->settings = apply_filters( 'woocommerce_pos_settings_tabs_array', $settings );
	}

	public function enqueue_admin_styles() {

	}

	public function enqueue_admin_scripts() {

		wp_enqueue_script(
			WC_POS_PLUGIN_NAME . '-core',
			WC_POS_PLUGIN_URL . 'assets/js/core.min.js',
			array( 'jquery', 'backbone', 'underscore' ),
			WC_POS_VERSION,
			true
		);

		wp_enqueue_script(
			WC_POS_PLUGIN_NAME . '-admin-app',
			WC_POS_PLUGIN_URL . 'assets/js/admin_app.min.js',
			array( WC_POS_PLUGIN_NAME . '-core' ),
			WC_POS_VERSION,
			true
		);

		wp_enqueue_script(
			WC_POS_PLUGIN_NAME . '-settings-app',
			WC_POS_PLUGIN_URL . 'assets/js/settings_app.min.js',
			array( WC_POS_PLUGIN_NAME . '-admin-app' ),
			WC_POS_VERSION,
			true
		);

	}

	static public function display_settings_page() {
		echo 'why hello';
	}

}