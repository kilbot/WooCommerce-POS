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

  private $products;
  private $orders;
  private $customers;
  private $coupons;

  public function __construct( WC_POS_Gateways $gateways ) {
    if( ! is_pos() )
      return;

    $this->products   = new WC_POS_API_Products();
    $this->orders     = new WC_POS_API_Orders( $gateways );
    $this->customers  = new WC_POS_API_Customers();
    $this->coupons    = new WC_POS_API_Coupons();

    add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );
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

  /**
   * Get all the ids for a given post_type
   * @return json
   */
  public function get_all_ids() {
    $entity = isset($_REQUEST['type']) ? $_REQUEST['type'] : false;
    $updated_at_min = isset($_REQUEST['updated_at_min']) ? $_REQUEST['updated_at_min'] : false;

    $has_method = property_exists($this, $entity) &&
      is_object($this->{$entity}) &&
      method_exists($this->{$entity}, 'get_ids');

    if($has_method){
      $result = $this->{$entity}->get_ids($updated_at_min);
    } else {
      $result = new WP_Error(
        'woocommerce_pos_get_ids_error',
        /* translators: woocommerce */
        sprintf( __( 'There was an error calling %s::%s', 'woocommerce' ), 'WC_POS_API', $entity ),
        array( 'status' => 500 )
      );
    }

    WC_POS_AJAX::serve_response($result);
  }

}