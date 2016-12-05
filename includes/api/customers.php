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

namespace WC_POS\API;

use WC_API_Resource;
use WC_API_Server;
use WP_User_Query;

class Customers extends WC_API_Resource {

  /** @var string $base the route base */
  protected $base = '/customers';


  /**
   * @param WC_API_Server $server
   */
  public function __construct( WC_API_Server $server ) {
    parent::__construct( $server );
    add_filter( 'woocommerce_api_customer_response', array( $this, 'customer_response' ), 10, 4 );

    if( $server->path === $this->base || $server->path === $this->base . '/ids' ){
      add_action( 'pre_get_users', array( $this, 'pre_get_users' ), 5 );
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
    if ( version_compare( $wp_version, '4.4', '>=' ) ) {
      $roles = wc_pos_get_option( 'customers', 'customer_roles' );

      if ( is_array( $roles ) && !in_array( 'all', $roles ) ) {
        $wp_user_query->query_vars[ 'role__in' ] = $roles;
      }

      // special case: no customer roles
      if ( is_null( $roles ) ) {
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

      // wildcard by default
      if ( isset( $_GET[ 'filter' ][ 'q' ] ) ) {
        $query = $_GET[ 'filter' ][ 'q' ];
        if(is_string($query)){
          $wp_user_query->query_vars[ 'search' ] = '*' . trim( $_GET[ 'filter' ][ 'q' ], '*' ) . '*';
        }
        if(is_array($query)){
          $wp_user_query->query_vars[ 'search' ] = '';
          $wp_user_query->query_vars[ '_pos_query' ] = $query;
        }
      }

      // search columns: 'ID', 'user_login', 'user_email', 'user_url', 'user_nicename'
      if ( isset( $_GET[ 'filter' ][ 'fields' ] ) ) {
        $fields = $_GET[ 'filter' ][ 'fields' ];
        $fields = is_string($fields) ? explode(',', $fields) : $fields;
        $search_columns = array();
        $translate = array(
          'id' => 'ID',
          'email' => 'user_email',
          'username' => 'user_login'
        );
        foreach( $fields as $field ) {
          $search_columns[] = isset($translate[$field]) ? $translate[$field] : $field;
        }
        if(!in_array('user_login', $search_columns)){
          $search_columns[] = 'user_login'; // required
        }
        $wp_user_query->query_vars[ 'search_columns' ] = $search_columns;
      }

    }

  }

  /**
   *
   *
   * @param $wp_user_query
   */
  public function pre_user_query( $wp_user_query ) {

    if(!isset($wp_user_query->query_vars[ 'search' ]))
      return;

    $term = trim( $wp_user_query->query_vars[ 'search' ], '*' );

    if ( !empty( $term ) ) {
      $this->simple_search( $term, $wp_user_query );
    }

    if( isset($wp_user_query->query_vars[ '_pos_query' ]) ){
      $queries = $wp_user_query->query_vars[ '_pos_query' ];
      $this->complex_search( $queries, $wp_user_query );
    }

  }

  /**
   * Extends customer search, allows more fields
   *
   * @param $term
   * @param $wp_user_query
   */
  private function simple_search($term, $wp_user_query) {
    global $wpdb;
    $meta_keys = array();
    $ids = array();

    foreach ( $wp_user_query->query_vars[ 'search_columns' ] as $field ) {
      if ( $field == 'first_name' ) $meta_keys[] = "meta_key='$field'";
      if ( $field == 'last_name' ) $meta_keys[] = "meta_key='$field'";
      if ( substr( $field, 0, 16 ) == 'billing_address.' ) {
        $field = str_replace( 'billing_address.', 'billing_', $field );
        $meta_keys[] = "meta_key='$field'";
      }
      if ( substr( $field, 0, 17 ) == 'shipping_address.' ) {
        $field = str_replace( 'shipping_address.', 'shipping_', $field );
        $meta_keys[] = "meta_key='$field'";
      }
    }

    // search usermeta table
    if ( !empty( $meta_keys ) ) {
      $ids = $wpdb->get_col( "
        SELECT DISTINCT user_id
        FROM $wpdb->usermeta
        WHERE (" . implode( ' OR ', $meta_keys ) . ")
        AND LOWER(meta_value)
        LIKE '%" . $term . "%'
      " );
    }


    if ( !empty( $ids ) ) {
      $wp_user_query->query_where = str_replace(
        "user_login LIKE '%$term%'",
        "user_login LIKE '%$term%' OR ID IN(" . implode( ',', $ids ) . ")",
        $wp_user_query->query_where
      );
    }
  }

  /**
   * @param array $queries
   * @param $wp_user_query
   */
  private function complex_search(array $queries, $wp_user_query){
    $ORs = array();

    foreach($queries as $query){
      $type = isset($query['type']) ? $query['type'] : '';
      $term = isset($query['query']) ? $query['query'] : '';
      if($type == 'prefix'){
        $prefix = isset($query['prefix']) ? $query['prefix'] : '';
        if($prefix == 'id'){
          $ORs[] = 'ID = ' . $term;
        }
      }
    };

    if(!empty($ORs)){
      $wp_user_query->query_where .= ' AND (' . implode(' OR ', $ORs) .') ';
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
      'fields'  => 'ID',
      'order'   => isset($filter['order']) ? $filter['order'] : 'ASC',
      'orderby' => isset($filter['orderby']) ? $filter['orderby'] : 'meta_key',
      'meta_key'=> isset($filter['meta_key']) ? $filter['meta_key'] : 'last_name'
    );

    if( isset( $filter['updated_at_min'] ) && !empty($filter['updated_at_min']) ){
      $args['meta_key']      = '_user_modified_gmt';
      $args['meta_value']    = $this->server->parse_datetime( $filter['updated_at_min'] );
      $args['meta_compare']  = '>';
    }

    $query = new \WP_User_Query( $args );
    $this->server->add_pagination_headers($query);
    return array( 'customers' => array_map( array( $this, 'format_id' ), $query->results ) );
  }


  /**
   * @param $id
   * @return array
   */
  private function format_id( $id ) {
    return array( 'id' => (int) $id );
  }


}