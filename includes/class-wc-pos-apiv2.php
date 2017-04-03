<?php

/**
 * WC REST API Class
 *
 * @class    WC_POS_API
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_APIv2 {


  /**
   *
   */
  public function __construct() {
    if( ! is_pos() )
      return;

    // remove wc api authentication
    // - relies on ->api and ->authentication being publicly accessible
//    if( isset( WC()->api ) && isset( WC()->api->authentication ) ){
//      remove_filter( 'woocommerce_api_check_authentication', array( WC()->api->authentication, 'authenticate' ), 0 );
//    }

//    add_filter( 'determine_current_user', array( $this, 'wc_api_authentication' ), 20, 0 );
    add_filter( 'woocommerce_api_dispatch_args', array( $this, 'dispatch_args'), 10, 2 );
    add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );

    add_filter( 'rest_dispatch_request', array( $this, 'rest_dispatch_request' ), 10, 4 );
    add_filter( 'rest_request_before_callbacks', array( $this, 'rest_request_before_callbacks' ), 10, 3 );
  }

  /**
   * Bypass authentication for WC REST API
   * @return WP_User object
   */
  public function wc_api_authentication() {
    global $current_user;
    $user = $current_user;

    if( ! user_can( $user->ID, 'access_woocommerce_pos' ) )
      $user = new WP_Error(
        'woocommerce_pos_authentication_error',
        __( 'User not authorized to access WooCommerce POS', 'woocommerce-pos' ),
        array( 'status' => 401 )
      );

    return $user;
  }


  /**
   * @param $args
   * @param $callback
   * @return mixed
   */
  public function dispatch_args($args, $callback){
    $wc_api_handler = get_class($callback[0]);

    $has_data = in_array( $args['_method'], array(2, 4, 8) ) && isset( $args['data'] ) && is_array( $args['data'] );
    if( $has_data ){
      // remove status
      if( array_key_exists('status', $args['data']) ){
        unset($args['data']['status']);
      }
    }

    switch($wc_api_handler){
      case 'WC_API_Products':
        new WC_POS_API_Products();
        break;
      case 'WC_API_Orders':
        if( $has_data && !isset( $args['data']['order'] ) ){
          $data = $args['data'];
          unset( $args['data'] );
          $args['data']['order'] = $data;
        }
        new WC_POS_API_Orders();
        break;
      case 'WC_API_Customers':
        new WC_POS_API_Customers();
        break;
      case 'WC_API_Coupons':
        new WC_POS_API_Coupons();
        break;
    }

    return $args;
  }


  /**
   * @param $response
   * @param $handler
   * @param $request
   * @return mixed
   */
  public function rest_request_before_callbacks( $response, $handler, $request ) {
    $wc_api_handler = get_class($handler['callback'][0]);

    switch($wc_api_handler) {
      case 'WC_REST_Products_Controller':
        new WC_POS_APIv2_Products();
        break;
    }

    return $response;
  }

  /**
   * - this filter was introduced in WC 2.3
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

    // required for compatibility WC < 2.4
    if ( ! empty( $request_args['not_in'] ) ) {
      $args['post__not_in'] = explode(',', $request_args['not_in']);
      unset( $request_args['not_in'] );
    }

    return $args;
  }


  /**
   * @param null $halt
   * @param $request
   * @param $route
   * @param $handler
   * @return mixed
   */
  public function rest_dispatch_request( $halt, $request, $route, $handler ) {

    if( isset($request['filter']) ) {
      $filter = $request['filter'];

      if( isset($filter['limit']) ) {
        $request['per_page'] = $filter['limit'];
      }

      if( isset($filter['in']) ) {
        $request['include'] = explode( ',', $filter['in'] );
      }

      if( isset($filter['not_in']) ) {
        $request['include'] = explode( ',', $filter['not_in'] );
      }

    }

    return $halt;
  }

  /**
   * Get all the ids for a given post_type
   * @return json
   */
  static public function get_all_ids() {
    $entity = isset($_REQUEST['type']) ? $_REQUEST['type'] : false;
    $updated_at_min = isset($_REQUEST['updated_at_min']) ? $_REQUEST['updated_at_min'] : false;
    $class_name = 'WC_POS_API_' . ucfirst( $entity );
    $handler = new $class_name();

    if(method_exists($handler, 'get_ids')){
      $result = call_user_func(array($handler, 'get_ids'), $updated_at_min);
    } else {
      $result = new WP_Error(
        'woocommerce_pos_get_ids_error',
        /* translators: woocommerce */
        sprintf( __( 'There was an error calling %s::%s', 'woocommerce' ), 'WC_POS_API', $entity ),
        array( 'status' => 500 )
      );
    }

    WC_POS_Server::response($result);
  }

}