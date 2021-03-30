<?php

/**
 * Plugin Name:       WooCommerce POS
 * Plugin URI:        https://wordpress.org/plugins/woocommerce-pos/
 * Description:       A simple front-end for taking WooCommerce orders at the Point of Sale. Requires <a href="http://wordpress.org/plugins/woocommerce/">WooCommerce</a>.
 * Version:           0.4.26
 * Author:            kilbot
 * Author URI:        http://woopos.com.au
 * Text Domain:       woocommerce-pos
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 * WC requires at least: 2.3.7
 * WC tested up to: 5.1
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
define( 'WC_POS_VERSION', '0.4.26' );
define( 'WC_POS_PLUGIN_NAME', 'woocommerce-pos' );
define( 'WC_POS_PLUGIN_FILE', plugin_basename( __FILE__ ) ); // 'woocommerce-pos/woocommerce-pos.php'
define( 'WC_POS_PLUGIN_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'WC_POS_PLUGIN_URL', trailingslashit( plugins_url( basename( plugin_dir_path( __FILE__ ) ), basename( __FILE__ ) ) ) );

/**
 * The code that runs during plugin activation.
 */
require_once WC_POS_PLUGIN_PATH . 'includes/class-wc-pos-activator.php';
new WC_POS_Activator( plugin_basename( __FILE__ ) );

/**
 * The code that runs during plugin deactivation.
 */
require_once WC_POS_PLUGIN_PATH . 'includes/class-wc-pos-deactivator.php';
new WC_POS_Deactivator( plugin_basename( __FILE__ ) );
