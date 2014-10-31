<?php

/**
 * The main POS Class
 *
 * @class 	  WC_POS
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS {

	/**
	 * Constructor
	 */
	public function __construct() {

		// auto load classes
		if ( function_exists( 'spl_autoload_register' ) ) {
			spl_autoload_register( array( $this, 'autoload' ) );
		}

		$this->init();

		add_filter( 'woocommerce_api_check_authentication', array( $this, 'wc_api_authentication' ) );
		do_action( 'woocommerce_pos_loaded' );

	}

	/**
	 * Autoload classes
	 * turns WC_POS_i18n into includes/class-wc-pos-i18n.php and
	 * WC_POS_Admin_Settings into includes/admin/class-wc-pos-settings.php
	 *
	 * @param $class
	 */
	private function autoload( $class ) {
		$cn = preg_replace( '/^wc_pos_/', '', strtolower( $class ), 1, $count );
		if( $count ) {
			$path = explode('_', $cn);
			if( $path[0] == 'pro' ) return;
			$last = 'class-wc-pos-'. array_pop( $path ) .'.php';
			array_push( $path, $last );
			$file = WC_POS_PLUGIN_PATH . 'includes/' . implode( '/', $path );
			if( is_readable( $file ) )
				require_once $file;
		}
	}

	/**
	 * Load the required resources
	 */
	private function init() {

		// global helper functions
		require_once WC_POS_PLUGIN_PATH . 'includes/wc-pos-functions.php';

		new WC_POS_i18n();          // internationalization
		new WC_POS_Template();      // POS front end
		new WC_POS_Products();      // products
		new WC_POS_Gateways();      // pos payment gateways

		// front-end only
		if( ! is_admin() ) {

		}

		// admin only
		if ( is_admin() ) {
			new WC_POS_Admin();
		}

	}

	/**
	 * Bypass authentication for WC REST API
	 *
	 * @param $user
	 *
	 * @return WP_User object
	 */
	public function wc_api_authentication( $user ) {

		if( is_pos() ) {
			global $current_user;
			$user = $current_user;

			if( ! user_can( $user->ID, 'manage_woocommerce_pos' ) )
				$user = new WP_Error( 'woocommerce_pos_authentication_error', __( 'User not authorized to manage WooCommerce POS', 'woocommerce-pos' ), array( 'code' => 500 ) );
		}

		return $user;
	}

}