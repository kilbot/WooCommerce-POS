<?php

/**
 * The main POS Class
 *
 * @class     WC_POS
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

namespace WC_POS;

class Setup {

  /**
   * Constructor
   */
  public function __construct() {

    // global helper functions
    require_once PLUGIN_PATH . 'includes/wc-pos-functions.php';

    add_action( 'init', array( $this, 'init' ) );
    add_action( 'woocommerce_api_loaded', array( $this, 'load_woocommerce_pos_api') );
    do_action( 'woocommerce_pos_loaded' );

  }

  /**
   * Load the required resources
   */
  public function init() {

    // common classes
    new i18n();
    new Gateways();
    new Products();
    new Customers();

    // ajax only
    if( is_admin() && (defined('\DOING_AJAX') && \DOING_AJAX) ){
      new AJAX();
    }

    // admin only
    if( is_admin() && !(defined('\DOING_AJAX') && \DOING_AJAX) ){
      new Admin();
    }

    // frontend only
    else {
      new Template();
    }

    // load integrations
    $this->integrations();

  }

  /**
   * Loads the POS API and patches to the WC REST API
   */
  public function load_woocommerce_pos_api(){
    if( is_pos() ){
      new API();
    }
  }

  /**
   * Loads POS integrations with third party plugins
   */
  private function integrations(){

    // WooCommerce Bookings - http://www.woothemes.com/products/woocommerce-bookings/
    if( class_exists( 'WC-Bookings' ) ){
      new Integrations\Bookings();
    }

  }

}