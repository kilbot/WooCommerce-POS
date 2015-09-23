<?php

/**
 * The main POS Class
 *
 * @class     WC_POS
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

    add_action( 'init', array( $this, 'init' ) );
    add_action( 'woocommerce_api_loaded', array( $this, 'load_woocommerce_api_patches') );
    do_action( 'woocommerce_pos_loaded' );

  }

  /**
   * Autoload classes + pseudo namespacing
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
  public function init() {

    // global helper functions
    require_once WC_POS_PLUGIN_PATH . 'includes/wc-pos-functions.php';

    // global
    $i18n = new WC_POS_i18n();
    new WC_POS_Gateways();
    new WC_POS_Products();
    new WC_POS_Template();

    if ( is_admin() ) {
      new WC_POS_Admin();

      // ajax only
      if (defined('DOING_AJAX') && DOING_AJAX ) {
        new WC_POS_AJAX( $i18n );
      }
    }

  }

  /**
   *
   */
  public function load_woocommerce_api_patches(){
    new WC_POS_API();
  }

}