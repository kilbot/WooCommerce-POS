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

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

class WC_POS_API_Coupons extends WC_API_Coupons {

  /**
   * Add special case for all coupon ids
   *
   * @param null  $fields
   * @param array $filter
   * @param int   $page
   * @return array
   */
  public function get_coupons( $fields = null, $filter = array(), $page = 1 ) {
    if( $fields == 'id' && isset( $filter['limit'] ) && $filter['limit'] == -1 ){
      return array( 'coupons' => $this->get_all_ids( $filter ) );
    }
    return parent::get_coupons( $fields, $filter, $page );
  }

  /**
   * Returns array of all coupon ids
   *
   * @param array $filter
   * @return array|void
   */
  private function get_all_ids( $filter = array() ) {
    $args = array(
      'post_type'      => array( 'shop_coupon' ),
      'post_status'    => array( 'publish' ),
      'posts_per_page' => -1,
      'fields'         => 'ids'
    );

    if ( isset( $filter[ 'updated_at_min' ] ) ) {
      $args[ 'date_query' ][] = array(
        'column'    => 'post_modified_gmt',
        'after'     => $filter[ 'updated_at_min' ],
        'inclusive' => false
      );
    }

    $query = new WP_Query( $args );
    return array_map( array( $this, 'format_id' ), $query->posts );
  }


  /**
   * @param $id
   * @return array
   */
  private function format_id( $id ) {
    return array( 'id' => $id );
  }

}