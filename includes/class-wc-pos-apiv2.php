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
      case 'WC_REST_Orders_Controller':
        new WC_POS_APIv2_Orders();
        break;
      case 'WC_REST_Customers_Controller':
        new WC_POS_APIv2_Customers();
        break;
      case 'WC_REST_Coupons_Controller':
        new WC_POS_APIv2_Coupons();
        break;
    }

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

    if( isset($request['filter']) ) {
      $filter = $request['filter'];

      if( isset($filter['q'])  ) {
        $request->set_param('search', $filter['q']);
      }

      if( isset($filter['limit']) ) {
        $request->set_param('per_page', $filter['limit']);
      }

      if( isset($filter['in']) ) {
        $request->set_param('include', explode( ',', $filter['in'] ));
      }

      if( isset($filter['not_in']) ) {
        $request->set_param('exclude', explode( ',', $filter['not_in'] ));
      }

      if( isset($filter['featured']) ) {
        $request->set_param('featured', $filter['featured']);
      }

      if( isset($filter['on_sale']) ) {
        $request->set_param('on_sale', $filter['on_sale']);
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
    $class_name = 'WC_POS_APIv2_' . ucfirst( $entity );
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