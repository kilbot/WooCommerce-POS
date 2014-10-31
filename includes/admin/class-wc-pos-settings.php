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

	/* @var string The db prefix for WP Options table */
	const DB_PREFIX = 'woocommerce_pos_settings_';

	/* @var string The settings screen id */
	private $screen_id;

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'current_screen', array( $this, 'conditional_init' ) );
	}

	/**
	 * Add Settings page to admin menu
	 */
	public function admin_menu() {
		$this->screen_id = add_submenu_page(
			WC_POS_PLUGIN_NAME,
			__( 'Settings', 'woocommerce-pos' ),
			__( 'Settings', 'woocommerce-pos' ),
			'manage_woocommerce_pos',
			'wc_pos_settings',
			array( $this, 'display_settings_page' )
		);
	}

	/**
	 * Enqueue scripts for the settings page
	 *
	 * @param $current_screen
	 */
	public function conditional_init( $current_screen ) {
		if( $current_screen->id == $this->screen_id ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
			add_action( 'admin_print_footer_scripts', array( $this, 'admin_inline_js' ) );
		}
	}

	/**
	 * Output the settings pages
	 */
	public function display_settings_page() {
		$settings = apply_filters( 'woocommerce_pos_settings_tabs_array', array(
			new WC_POS_Admin_Settings_General(),
			new WC_POS_Admin_Settings_Checkout()
		));

		include 'views/settings.php';
	}

	/**
	 * Get settings data
	 * @return array
	 */
	static public function get_settings() {

		// validate
		if( !isset( $_GET['id'] ) )
			wp_die('There is no option id');

		// get settings
		$settings = get_option( self::DB_PREFIX . $_GET['id'] );

		// default settings for gateways
		if( !$settings ) {
			$gateway_id = preg_replace( '/^gateway_/', '', $_GET['id'], 1, $count );
			if( $count ) {
				$settings = get_option( self::DB_PREFIX . $_GET['id'] );
			}
		}

		return $settings;
	}

	/**
	 * Save settings data
	 * @return array
	 */
	static public function save_settings() {
		$data = json_decode(trim(file_get_contents('php://input')), true);

		// validate
		if( !isset( $data['id'] ) )
			wp_die('There is no option id');

		// reserved option names
		if( isset( $data['response'] ) )
			wp_die('Data name "response" is reserved');

		// add timestamp to force update
		$data['updated'] = current_time( 'timestamp' );

		// remove the security attribute
		unset( $data['security'] );

		// update settings
		if( update_option( self::DB_PREFIX . $data['id'], $data ) ) {
			$response = array(
				'result' => 'success',
				'notice' => __( 'Settings saved', 'woocommerce-pos' )
			);
		} else {
			$response = array(
				'result' => 'error',
				'notice' => __( 'Settings not saved', 'woocommerce-pos' )
			);
		}

		$return['response'] = $response;
		return $return;
	}

	/**
	 * Settings styles
	 */
	public function enqueue_admin_styles() {
		wp_enqueue_style(
			WC_POS_PLUGIN_NAME . '-admin',
			WC_POS_PLUGIN_URL . 'assets/css/admin.min.css',
			null,
			WC_POS_VERSION
		);
	}

	/**
	 * Settings scripts
	 */
	public function enqueue_admin_scripts() {

		wp_enqueue_script( 'jquery-ui-sortable' );

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

		wp_enqueue_script(
			WC_POS_PLUGIN_NAME . '-admin-components',
			WC_POS_PLUGIN_URL . 'assets/js/admin_components.min.js',
			array( WC_POS_PLUGIN_NAME . '-admin-app' ),
			WC_POS_VERSION,
			true
		);

		$locale_js = WC_POS_i18n::get_locale_js();
		if( $locale_js ) {
			wp_enqueue_script(
				WC_POS_PLUGIN_NAME . '-js-locale',
				$locale_js,
				array( WC_POS_PLUGIN_NAME . '-admin-components' ),
				WC_POS_VERSION,
				true
			);
		}
	}

	/**
	 * Start the Settings App
	 */
	public function admin_inline_js() {
		echo '<script type="text/javascript">POS.start();</script>';
	}

}