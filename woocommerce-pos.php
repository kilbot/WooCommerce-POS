<?php

/**
 * Plugin Name:       WooCommerce POS
 * Plugin URI:        https://woopos.com.au
 * Description:       A simple front-end for taking WooCommerce orders at the Point of Sale. Requires <a href="http://wordpress.org/plugins/woocommerce/">WooCommerce</a>.
 * Version:           0.4
 * Author:            kilbot
 * Author URI:        http://www.kilbot.com.au
 * Text Domain:       woocommerce-pos
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
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

/**
 * Define plugin constants.
 */
define( 'WC_POS_VERSION', '0.4' );
define( 'WC_POS_PLUGIN_NAME', 'woocommerce-pos' );
define( 'WC_POS_PLUGIN_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'WC_POS_PLUGIN_URL', trailingslashit( plugins_url( basename( plugin_dir_path( __FILE__ ) ), basename( __FILE__ ) ) ) );

/**
 * The code that runs during plugin activation.
 */
require_once WC_POS_PLUGIN_PATH . 'includes/class-wc-pos-activator.php';
register_activation_hook( __FILE__, array( 'WC_POS_Activator', 'activate' ) );

/**
 * The code that runs during plugin deactivation.
 */
require_once WC_POS_PLUGIN_PATH . 'includes/class-wc-pos-deactivator.php';
register_deactivation_hook( __FILE__, array( 'WC_POS_Deactivator', 'deactivate' ) );

/**
 * The core plugin class.
 */
require_once WC_POS_PLUGIN_PATH . 'includes/class-wc-pos.php';

/**
 * Begins execution of the plugin.
 */
add_action( 'woocommerce_loaded', 'run_woocommerce_pos' );
function run_woocommerce_pos() {
	new WC_POS();
}