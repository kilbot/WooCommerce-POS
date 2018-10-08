<?php

/**
 * WC REST API Class
 *
 * @class    WC_POS_API
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS;

class API {

  /**
   *
   */
  public function __construct() {
    $this->init();
    add_filter('http_request_args', array($this, 'http_request_args'), 10, 2);


    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
      header( 'Access-Control-Allow-Origin: *' );
      header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE' );
      header( 'Access-Control-Allow-Credentials: true' );
      header( 'Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-WC-POS, Authorization' );
      return $value;
    });

//    add_filter( 'woocommerce_api_classes', array( $this, 'api_classes' ) );
//    add_filter( 'woocommerce_api_dispatch_args', array( $this, 'dispatch_args'), 10, 2 );
//    add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );
  }


  /**
   *
   */
  private function init() {
    $controllers = array(
      '\WC_POS\API\v1\Users',
    );

    foreach ( $controllers as $controller ) {
      $controller = new $controller();
      $controller->register_routes();
    }
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
      '\WC_POS\API\Coupons',
      '\WC_POS\API\Customers',
      '\WC_POS\API\i18n',
      '\WC_POS\API\Orders',
      '\WC_POS\API\Params',
      '\WC_POS\API\Payload',
      '\WC_POS\API\Products',
      '\WC_POS\API\Templates'
    );

    // frontend only
    if( current_user_can('access_woocommerce_pos') ){
      array_push( $classes, '\WC_POS\API\Gateways', '\WC_POS\API\Support' );
    }

    // admin only
    if( current_user_can('manage_woocommerce_pos') ){
      array_push( $classes, '\WC_POS\API\Settings' );
    }

    return $classes;
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
