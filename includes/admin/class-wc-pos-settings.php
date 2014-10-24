<?php

/**
 * WP Settings Class
 *
 * @class    WC_POS_Admin_Settings
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings {

	static public $settings = array();

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
		self::$settings = apply_filters( 'woocommerce_pos_settings_tabs_array', $settings );
	}

	static public function display_settings_page() {
		include_once 'views/settings.php';
	}

	static public function save_settings() {

		// get db_key
		if( empty( $_REQUEST['key'] ) )
			wp_die('There is no option key');

		// get data
		if( empty( $_REQUEST[$_REQUEST['key']] ) )
			wp_die('There is no option data');

		$key = $_REQUEST['key'];
		$value = $_REQUEST[$_REQUEST['key']];

		// save timestamp
		if( isset( $data['updated'] ) )
			wp_die('Reserved field name: updated');
		else
			$value['updated'] = current_time( 'timestamp' );

		if( update_option( $key, $value ) ) {
			$response = array(
				'result' => 'success',
				'notice' => __( 'Settings saved!', 'woocommerce-pos' )
			);
		} else {
			$response = array(
				'result' => 'error',
				'notice' => __( 'Settings not saved!', 'woocommerce-pos' )
			);
		}

		return $response;
	}

	public function enqueue_admin_styles() {

	}

	public function enqueue_admin_scripts() {
		$screen = get_current_screen();

		if( $screen->id == WC_POS_Admin_Menu::$settings_screen_id ) {
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
	}

}