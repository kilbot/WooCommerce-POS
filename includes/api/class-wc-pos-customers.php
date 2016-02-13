<?php

/**
 * POS Customer Class
 * duck punches the WC REST API
 *
 * @class    WC_POS_API_Customers
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

class WC_POS_API_Customers extends WC_API_Resource {

  /** @var string $base the route base */
  protected $base = '/customers';


  /**
   * @param WC_API_Server $server
   */
  public function __construct( WC_API_Server $server ) {
    parent::__construct( $server );
    add_filter( 'woocommerce_api_customer_response', array( $this, 'customer_response' ), 10, 4 );

    if( $server->path === $this->base ){
      add_action( 'pre_get_users', array( $this, 'pre_get_users' ) );
      add_action( 'pre_user_query', array( $this, 'pre_user_query' ) );
    }
  }


  /**
   * Register routes for POS Customers
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( $routes ) {

    # GET /customers/ids
    $routes[ $this->base . '/ids'] = array(
      array( array( $this, 'get_all_ids' ), WC_API_Server::READABLE ),
    );

    return $routes;
  }


  /**
   * - add `updated_at` to customer data
   *
   * @param $data
   * @param $customer
   * @param $fields
   * @param $server
   * @return
   */
  public function customer_response( $data, $customer, $fields, $server ){
    $timestamp = get_user_meta( $customer->ID , '_user_modified_gmt', true);
    $data['updated_at'] = $server->format_datetime( $timestamp );
    return $data;
  }


  /**
   *
   * @param $wp_user_query
   */
  public function pre_get_users( $wp_user_query ) {
    global $wp_version;

    $wp_user_query->query_vars[ 'role' ] = '';

    // WordPress 4.4 allows role__in and role__not_in
    if( version_compare($wp_version, '4.4', '>=') ) {
      $roles = wc_pos_get_option( 'customers', 'customer_roles' );

      if( is_array( $roles ) && ! in_array( 'all', $roles ) ){
        $wp_user_query->query_vars[ 'role__in' ] = $roles;
      }

      // special case: no customer roles
      if( is_null( $roles ) ){
        // ?
      }
    }

    if ( isset( $_GET[ 'filter' ] ) ) {

      // add support for filter[in]
      if ( isset( $_GET[ 'filter' ][ 'in' ] ) ) {
        $wp_user_query->query_vars[ 'include' ] = explode( ',', $_GET[ 'filter' ][ 'in' ] );
      }

      // add support for filter[not_in]
      if ( isset( $_GET[ 'filter' ][ 'not_in' ] ) ) {
        $wp_user_query->query_vars[ 'exclude' ] = explode( ',', $_GET[ 'filter' ][ 'not_in' ] );
      }

    }

  }

  /**
   *
   *
   * @param $wp_user_query
   */
  public function pre_user_query( $wp_user_query ) {

    // customer search
    $term = $wp_user_query->query_vars[ 'search' ];
    if ( !empty( $term ) ) {
      $this->customer_search( $term, $wp_user_query );
    }
  }

  /**
   * Extends customer search, allows more fields
   *
   * @param $term
   * @param $wp_user_query
   */
  private function customer_search($term, $wp_user_query){
    global $wpdb;

    // search usermeta table
    $usermeta_ids = $wpdb->get_col("
      SELECT DISTINCT user_id
      FROM $wpdb->usermeta
      WHERE (meta_key='first_name' OR meta_key='last_name')
      AND LOWER(meta_value)
      LIKE '%".$term."%'
    ");

    // search users table
    $users_ids = $wpdb->get_col("
      SELECT DISTINCT ID
      FROM $wpdb->users
      WHERE LOWER(user_nicename)
      LIKE '%".$term."%'
      OR LOWER(user_login)
      LIKE '%".$term."%'
    ");

    $ids = array_unique(array_merge($usermeta_ids,$users_ids));
    $ids_str = implode(',', $ids);

    if (!empty($ids_str)){
      $wp_user_query->query_where = str_replace(
        "user_nicename LIKE '".$term."'",
        "ID IN(".$ids_str.")",
        $wp_user_query->query_where
      );
    }
  }

  /**
   * Returns array of all user ids
   *
   * @param array $filter
   * @return array|void
   */
  public function get_all_ids( $filter = array() ){
    $args = array(
      'fields' => 'ID',
      'orderby' => 'ID'
    );

    if( isset( $filter['updated_at_min'] ) ){
      $args['meta_key']      = '_user_modified_gmt';
      $args['meta_value']    = $this->server->parse_datetime( $filter['updated_at_min'] );
      $args['meta_compare']  = '>';
    }

    $query = new WP_User_Query( $args );
    return array_map( array( $this, 'format_id' ), $query->results );
  }


  /**
   * @param $id
   * @return array
   */
  private function format_id( $id ) {
    return array( 'id' => $id );
  }


}