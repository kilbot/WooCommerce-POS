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
	 *
	 */
	public function __construct() {

		// auto load classes
		if ( function_exists( 'spl_autoload_register' ) ) {
			spl_autoload_register( array( $this, 'autoload' ) );
		}

		$this->init();

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
		new WC_POS_Products();      // products

		// admin
		if  ( is_admin() && ( ! defined( 'DOING_AJAX' ) || ! DOING_AJAX ) ) {
			new WC_POS_Admin();
		}

		// ajax
		if  ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			new WC_POS_AJAX();
		}

	}

}