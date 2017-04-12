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

class WC_POS_API_Coupons extends WC_POS_API_Abstract {

  /**
   * Returns array of all coupon ids
   * @param $updated_at_min
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
        'column'    => 'post_modified_gmt',
        'after'     => $date_modified,
        'inclusive' => false
      );
    }

    $query = new WP_Query( $args );
    return array_map( 'intval', $query->posts );
  }

}