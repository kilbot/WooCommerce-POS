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

  /* reference to payload class */
  public $payload;

  /**
   *
   */
  public function __construct() {

    // load POS API
    $this->register_rest_routes();

    // duck punch WC API
    add_filter( 'rest_dispatch_request', array( $this, 'rest_dispatch_request' ), 10, 4 );
    add_filter( 'rest_request_before_callbacks', array( $this, 'rest_request_before_callbacks' ), 10, 3 );

  }


  /**
   * payload endpoint will load all /pos endpoints
   */
  public function register_rest_routes() {
    $this->payload = new API\Payload();
    $this->payload->register_routes();
  }


  /**
   * @param $response
   * @param $handler
   * @param $request
   * @return mixed
   */
  public function rest_request_before_callbacks( $response, $handler, $request ) {
    $wc_api_handler = get_class($handler['callback'][0]);

//    switch($wc_api_handler) {
//      case 'WC_REST_Products_Controller':
//        $break = '';
//        new WC_POS_APIv2_Products();
//        break;
//      case 'WC_REST_Orders_Controller':
//        new WC_POS_APIv2_Orders();
//        break;
//      case 'WC_REST_Customers_Controller':
//        new WC_POS_APIv2_Customers();
//        break;
//      case 'WC_REST_Coupons_Controller':
//        new WC_POS_APIv2_Coupons();
//        break;
//    }

    return $response;
  }


  /**
   * @param null $halt
   * @param $request
   * @param $route
   * @param $handler
   * @return mixed
   */
  public function rest_dispatch_request( $halt, $request, $route, $handler ) {

    return $halt;
  }


}