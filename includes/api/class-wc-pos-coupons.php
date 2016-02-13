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

class WC_POS_API_Coupons extends WC_API_Resource {

  /** @var string $base the route base */
  protected $base = '/coupons';

  /**
   * Register routes for POS Coupons
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( $routes ) {

    # GET /coupons/ids
    $routes[ $this->base . '/ids'] = array(
      array( array( $this, 'get_all_ids' ), WC_API_Server::READABLE ),
    );

    return $routes;
  }


  /**
   * Returns array of all coupon ids
   *
   * @param array $filter
   * @return array|void
   */
  public function get_all_ids( $filter = array() ) {
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