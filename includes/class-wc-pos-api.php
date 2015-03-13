<?php

/**
 * WC REST API Class
 *
 * @class    WC_POS_API
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_API {

  /**
   * Constructor
   */
  public function __construct() {
    if( ! is_pos() )
      return;

    $this->init();
    add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );
  }

  /**
   * Load subclasses
   */
  private function init() {
    new WC_POS_API_Products();
    new WC_POS_API_Orders();
    new WC_POS_API_Customers();
  }

  /**
   * @param $args
   * @param $request_args
   * @return mixed
   */
  public function woocommerce_api_query_args($args, $request_args){

    // required for compatibility WC < 2.3.5
    if ( ! empty( $request_args['in'] ) ) {
      $args['post__in'] = explode(',', $request_args['in']);
      unset( $request_args['in'] );
    }

    return $args;
  }

}