<?php
/**
 * Plugin Name:       WooCommerce POS (beta)
 * Plugin URI:        https://woopos.com.au
 * Description:       A simple front-end for taking WooCommerce orders at the Point of Sale.
 * Version:           0.2.13
 * Author:            kilbot
 * Author URI:        http://www.kilbot.com.au
 * Text Domain:       woocommerce-pos-locale
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 * GitHub Plugin URI: https://github.com/kilbot/woocommerce-pos
 * GitHub Branch:     master
 * 
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://woopos.com.au
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
require_once( plugin_dir_path( __FILE__ ) . 'public/class-pos.php' );

// Register hooks that are fired when the plugin is activated or deactivated.
// When the plugin is deleted, the uninstall.php file is loaded.
register_activation_hook( __FILE__, array( 'WooCommerce_POS', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'WooCommerce_POS', 'deactivate' ) );

add_action( 'plugins_loaded', 'WC_POS' );
// returns the main instance of POS, global function
function WC_POS() {
	return WooCommerce_POS::get_instance();
}

/*----------------------------------------------------------------------------*
 * Dashboard and Administrative Functionality
 *----------------------------------------------------------------------------*/

if  ( is_admin() && ( ! defined( 'DOING_AJAX' ) || ! DOING_AJAX ) ) {

	require_once( plugin_dir_path( __FILE__ ) . 'admin/class-pos-admin.php' );
	add_action( 'plugins_loaded', array( 'WooCommerce_POS_Admin', 'get_instance' ) );

}
