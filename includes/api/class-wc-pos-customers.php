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

class WC_POS_API_Customers extends WC_POS_API_Abstract {

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'pre_get_users', array( $this, 'pre_get_users' ) );
    add_action( 'pre_user_query', array( $this, 'pre_user_query' ) );
    add_filter( 'woocommerce_api_customer_response', array( $this, 'customer_response' ), 10, 4 );
  }

  /**
   * Removes the role='customer' restraint
   * todo: add this option to settings
   * @param $wp_user_query
   */
  public function pre_get_users( $wp_user_query ) {

    $wp_user_query->query_vars[ 'role' ] = '';

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
   * @param $wp_user_query
   */
  public function pre_user_query( $wp_user_query ) {

    // customer search
    $term = $wp_user_query->query_vars['search'];
    if (!empty($term)){
      $this->customer_search($term, $wp_user_query);
    }
  }

  /**
   * Extends customer search
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
   * @param $updated_at_min
   * @return array
   */
  public function get_ids($updated_at_min){
    $args = array(
      'fields' => 'ID'
    );

    if($updated_at_min){
      $args['meta_key']      = '_user_modified_gmt';
      $args['meta_value']    = $this->parse_datetime( $updated_at_min );
      $args['meta_compare']  = '>';
    }

    $query = new WP_User_Query( $args );
    return array_map( 'intval', $query->results );
  }


  /**
   * - add `updated_at` to customer data
   *
   * @param $customer_data
   * @param $customer
   * @param $fields
   * @param $server
   * @return mixed
   */
  public function customer_response($customer_data, $customer, $fields, $server){
    $timestamp = get_user_meta($customer->ID, '_user_modified_gmt', true);
    $customer_data['updated_at'] = $server->format_datetime( $timestamp );
    return $customer_data;
  }


}