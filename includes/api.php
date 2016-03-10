<?php

/**
 * WC REST API Class
 *
 * @class    WC_POS_API
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS;

class API {

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
      'WC_POS\API\Products',
      'WC_POS\API\Orders',
      'WC_POS\API\Customers',
      'WC_POS\API\Coupons',
      'WC_POS\API\Payload',
      'WC_POS\API\Params',
      'WC_POS\API\i18n',
      'WC_POS\API\Templates'
    );

    // frontend only
    if( current_user_can('access_woocommerce_pos') ){
      array_push( $classes, 'WC_POS\API\Gateways', 'WC_POS\API\Support' );
    }

    // admin only
    if( current_user_can('manage_woocommerce_pos') ){
      array_push( $classes, 'WC_POS\API\Settings' );
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

    return new \WP_Error(
      'woocommerce_pos_authentication_error',
      __( 'User not authorized to access WooCommerce POS', 'woocommerce-pos' ),
      array( 'status' => 401 )
    );
  }

  /**
   * @todo this is a total hack, need to customise bb remote sync
   *
   * @param $args
   * @param $callback
   * @return mixed
   */
  public function dispatch_args($args, $callback){

    // note: using headers rather than query params, easier to manage through the js app
    $args['wc_pos_admin'] = is_pos_admin();

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

    /**
     * This is a safe guard against overloading the POS
     * - some theme developers use pre_get_posts to alter the no. of posts/products
     * - $query->set( 'posts_per_page', LARGE/-1 ) will grind the POS to a halt
     * - ensure the default is 10, unless specifically requested by the POS
     */
    if( empty( $args['posts_per_page'] ) ){
      $args['posts_per_page'] = 10;
    }

    // remove relevanssi
    remove_filter('posts_request', 'relevanssi_prevent_default_request');
    remove_filter('the_posts', 'relevanssi_query');

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