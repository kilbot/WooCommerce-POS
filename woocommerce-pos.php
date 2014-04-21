<?php
/**
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @license   GPL-2.0+
 * @link      http://www.kilbot.com.au
 * @copyright 2014 The Kilbot Factory
 *
 * @wordpress-plugin
 * Plugin Name:       WooCommerce POS
 * Plugin URI:        https://github.com/kilbot/WooCommerce-POS
 * Description:       A simple front-end for taking WooCommerce orders at the Point of Sale.
 * Version:           0.2
 * Author:            kilbot
 * Author URI:        http://www.kilbot.com.au
 * Text Domain:       woocommerce-pos-locale
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 * GitHub Plugin URI: https://github.com/kilbot/woocommerce-pos
 * GitHub Branch:     master
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// Check if WooCommerce is active and deactivate extension if it's not
if ( ! is_woocommerce_active() )
	return;

/*----------------------------------------------------------------------------*
 * Public-Facing Functionality
 *----------------------------------------------------------------------------*/

// require the initial plugin class
require_once( plugin_dir_path( __FILE__ ) . 'public/class-woocommerce-pos.php' );

// Register hooks that are fired when the plugin is activated or deactivated.
// When the plugin is deleted, the uninstall.php file is loaded.
register_activation_hook( __FILE__, array( 'WooCommerce_POS', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'WooCommerce_POS', 'deactivate' ) );

// instantiate the initial plugin class
add_action( 'plugins_loaded', array( 'WooCommerce_POS', 'get_instance' ) );

/*----------------------------------------------------------------------------*
 * Dashboard and Administrative Functionality
 *----------------------------------------------------------------------------*/

if ( is_admin() ) {

	require_once( plugin_dir_path( __FILE__ ) . 'admin/class-woocommerce-pos-admin.php' );
	add_action( 'plugins_loaded', array( 'WooCommerce_POS_Admin', 'get_instance' ) );

}
