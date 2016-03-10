<?php

/**
 * Plugin Name:       WooCommerce POS
 * Plugin URI:        https://wordpress.org/plugins/woocommerce-pos/
 * Description:       A simple front-end for taking WooCommerce orders at the Point of Sale. Requires <a href="http://wordpress.org/plugins/woocommerce/">WooCommerce</a>.
 * Version:           0.4.6-beta
 * Author:            kilbot
 * Author URI:        http://woopos.com.au
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

namespace WC_POS;

// If this file is called directly, abort.
if ( ! defined( '\WPINC' ) ) {
  die;
}

/**
 * Define plugin constants.
 */
define( __NAMESPACE__ . '\VERSION', '0.4.6-beta' );
define( __NAMESPACE__ . '\PLUGIN_NAME', 'woocommerce-pos' );
define( __NAMESPACE__ . '\PLUGIN_FILE', plugin_basename( __FILE__ ) ); // 'woocommerce-pos/woocommerce-pos.php'
define( __NAMESPACE__ . '\PLUGIN_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define( __NAMESPACE__ . '\PLUGIN_URL', trailingslashit( plugins_url( basename( plugin_dir_path( __FILE__ ) ), basename( __FILE__ ) ) ) );

/**
 * Autoloader
 */
if ( !function_exists( 'spl_autoload_register' ) ) {
  return;
}

spl_autoload_register( __NAMESPACE__ . '\\autoload' );
function autoload( $cls ) {
  $cls = ltrim( $cls, '\\' );
  if( substr( $cls, 0, strlen( __NAMESPACE__ ) ) !== __NAMESPACE__ ) {
    return;
  }

  $cls = str_replace( __NAMESPACE__, '', $cls );
  $file = PLUGIN_PATH . 'includes' . str_replace( '\\', DIRECTORY_SEPARATOR, strtolower( $cls ) ) . '.php';
  if(is_readable($file)){
    require_once( $file );
  } else {
    $break = '';
  }
}

/**
 * Activate plugin
 */
new Activator();

/**
 * Deactivate plugin
 */
new Deactivator();