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
    add_filter( 'rest_request_before_callbacks', array( $this, 'rest_request_before_callbacks' ), 10, 3 );
    add_filter( 'rest_dispatch_request', array( $this, 'rest_dispatch_request' ), 10, 4 );

  }


  /**
   * payload endpoint will load all /pos endpoints
   */
  public function register_rest_routes() {

    $controllers = array(
      'i18n'        => new \WC_POS\API\i18n(),
      'params'      => new \WC_POS\API\Params(),
      'templates'   => new \WC_POS\API\Templates(),
      'gateways'    => new \WC_POS\API\Gateways(),
      'settings'    => new \WC_POS\API\Settings()
    );

    $payload = new \WC_POS\API\Payload( $controllers );
    $payload->register_routes();

    foreach($controllers as $controller){
      $controller->register_routes();
    }

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
        new \WC_POS\API\Products();
        break;
//      case 'WC_REST_Orders_Controller':
//        new \WC_POS\API\Orders();
//        break;
//      case 'WC_REST_Customers_Controller':
//        new \WC_POS\API\Customers();
//        break;
//      case 'WC_REST_Coupons_Controller':
//        new \WC_POS\API\Coupons();
//        break;
    }

    return $response;
  }


  /**
   * @param null $response
   * @param $request
   * @param $route
   * @param $handler
   * @return mixed
   */
  public function rest_dispatch_request( $response, $request, $route, $handler ) {
    return $response;
  }


}