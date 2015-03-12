<?php
/**
 * Plugin Name:		WooCommerce POS Pro
 * Plugin URI:		https://woopos.com.au/pro
 * Description:		WooCommerce POS Pro adds extra functionality to the free plugin.
 * Version:			0.3.2
 * Author:			kilbot
 * Author URI:		http://www.kilbot.com.au
 * Text Domain:		woocommerce-pos-pro-locale
 * Domain Path:		/languages
 * License: 		Copyright The Kilbot Factory
 * 
 * @package 		WooCommerce POS Pro
 * @author 			Paul Kilmurray <paul@kilbot.com.au>
 * @link 			http://woopos.com.au
 * @copyright 		Copyright (c) The Kilbot Factory
 *
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/*----------------------------------------------------------------------------*
 * Public-Facing Functionality
 *----------------------------------------------------------------------------*/

// require the initial plugin class
require_once( plugin_dir_path( __FILE__ ) . 'public/class-pro.php' );

add_action( 'plugins_loaded', 'WC_POS_Pro' );
// returns the main instance of POS, global function
function WC_POS_Pro() {
	return WooCommerce_POS_Pro::get_instance();
}

/*----------------------------------------------------------------------------*
 * Dashboard and Administrative Functionality
 *----------------------------------------------------------------------------*/

if  ( is_admin() && ( ! defined( 'DOING_AJAX' ) || ! DOING_AJAX ) ) {

	/**
	 * Displays an inactive message if the API License Key has not yet been activated
	 */
	if ( get_option( 'woocommerce_pos_pro_activated' ) != 'Activated' ) {
	    add_action( 'admin_notices', 'WooCommerce_POS_Pro_Admin::inactive_notice' );
	}

	require_once( plugin_dir_path( __FILE__ ) . 'admin/class-pro-admin.php' );

	// Register hooks that are fired when the plugin is activated or deactivated.
	// When the plugin is deleted, the uninstall.php file is loaded.
	register_activation_hook( __FILE__, array( 'WooCommerce_POS_Pro_Admin', 'activate' ) );
	register_deactivation_hook( __FILE__, array( 'WooCommerce_POS_Pro_Admin', 'deactivate' ) );

	add_action( 'plugins_loaded', array( 'WooCommerce_POS_Pro_Admin', 'get_instance' ) );

}