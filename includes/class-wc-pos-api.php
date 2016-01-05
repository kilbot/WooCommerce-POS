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
   *
   */
  public function __construct() {

    // remove wc api authentication
    // - relies on ->api and ->authentication being publicly accessible
    if( isset( WC()->api ) && isset( WC()->api->authentication ) ){
      remove_filter( 'woocommerce_api_check_authentication', array( WC()->api->authentication, 'authenticate' ), 0 );
    }

    // support for X-HTTP-Method-Override for WC < 2.4
    if( version_compare( WC()->version, '2.4', '<' ) && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) ){
      $_GET['_method'] = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
    }

    add_filter( 'woocommerce_api_classes', array( $this, 'api_classes' ) );
    add_filter( 'woocommerce_api_check_authentication', array( $this, 'wc_api_authentication' ), 10, 0 );
    add_filter( 'woocommerce_api_dispatch_args', array( $this, 'dispatch_args'), 10, 2 );
    add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );
  }

  /**
   * Load API classes
   *
   * @param array $classes
   * @return array
   */
  public function api_classes( array $classes ){

    // common classes
    array_push(
      $classes,
      'WC_POS_API_Products',
      'WC_POS_API_Orders',
      'WC_POS_API_Customers',
      'WC_POS_API_Coupons',
      'WC_POS_API_Payload',
      'WC_POS_API_Params',
      'WC_POS_API_i18n',
      'WC_POS_API_Templates'
    );

    // frontend only
    if( current_user_can('access_woocommerce_pos') ){
      array_push( $classes, 'WC_POS_API_Gateways', 'WC_POS_API_Support' );
    }

    // admin only
    if( current_user_can('manage_woocommerce_pos') ){
      array_push( $classes, 'WC_POS_API_Settings' );
    }

    return $classes;
  }


  /**
   * Bypass authentication for WC REST API
   * @todo use OAuth, how to handle manage no access?
   *
   * @return WP_User object
   */
  public function wc_api_authentication() {
    global $current_user;
    $user = $current_user;

    if( user_can( $user->ID, 'access_woocommerce_pos' ) ) {
      return $user;
    }

    return new WP_Error(
      'woocommerce_pos_authentication_error',
      __( 'User not authorized to access WooCommerce POS', 'woocommerce-pos' ),
      array( 'status' => 401 )
    );
  }

  /**
   * @param $args
   * @param $callback
   * @return mixed
   */
  public function dispatch_args($args, $callback){

    // note: using headers rather than query params, easier to manage through the js app
    $args['wc_pos_admin'] = is_pos_admin();

    // parse data from js app
    if( ! isset( $args['data'] ) || ! isset( $args['data']['status'] ) ){
      return $args;
    }

    if( in_array( $args['data']['status'], array('CREATE_FAILED', 'UPDATE_FAILED') )){
      unset($args['data']['status']); // remove status

      // a hack to put data in the right format
      if( $args['_route'] == '/orders' ){
        $args['data'] = array(
          'order' => $args['data']
        );
      }
    }

    return $args;
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
   * Raw payload
   * @return array|mixed|string
   */
  static public function get_raw_data() {
    global $HTTP_RAW_POST_DATA;
    if ( !isset( $HTTP_RAW_POST_DATA ) ) {
      $HTTP_RAW_POST_DATA = trim(file_get_contents('php://input'));
    }
    return json_decode( $HTTP_RAW_POST_DATA, true);
  }

}