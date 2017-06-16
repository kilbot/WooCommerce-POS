<?php

/**
 * POS Coupons Class
 * duck punches the WC REST API
 *
 * @class    WC_POS_API_Coupons
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_APIv2_Coupons extends WC_POS_API_Abstract {


  /**
   *
   */
  public function __construct() {
    add_filter( 'woocommerce_rest_prepare_shop_coupon_object', array( $this, 'coupon_response' ), 10, 3 );
  }


  /**
   *
   *
   * @param WP_REST_Response $response The response object.
   * @param WC_Data $coupon Object data.
   * @param WP_REST_Request $request Request object.
   * @return WP_REST_Response
   */
  public function coupon_response( $response, $coupon, $request ) {
    $data = $response->get_data();

    // backwards compat
    if( isset($data['date_modified']) ) {
      $data['updated_at'] = $data['date_modified'];
    }

    $response->set_data($data);
    return $response;
  }


  /**
   * Returns array of all coupon ids
   * @param $date_modified
   * @return array
   */
  public function get_ids($date_modified){
    $args = array(
      'post_type'     => array('shop_coupon'),
      'post_status'   => array('publish'),
      'posts_per_page'=>  -1,
      'fields'        => 'ids'
    );

    if($date_modified){
      $args['date_query'][] = array(
        'column'    => 'post_modified',
        'after'     => $date_modified,
        'inclusive' => false
      );
    }

    $query = new WP_Query( $args );
    return array_map( 'intval', $query->posts );
  }

}