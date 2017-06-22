<?php

/**
 * The main POS Class
 *
 * @class     WC_POS
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.wcpos.com
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
    add_action( 'rest_api_init', array( $this, 'pos_api_init') );

    // emails filter called very early :(
    add_filter( 'woocommerce_defer_transactional_emails', array( $this, 'defer_transactional_emails' ) );

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
  public function pos_api_init(){
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

  /**
   * Don't defer emails for POS orders
   *
   * @param $defer
   * @return bool
   */
  public function defer_transactional_emails( $defer ) {
    if( is_pos() ) {
      return false;
    }
    return $defer;
  }

}