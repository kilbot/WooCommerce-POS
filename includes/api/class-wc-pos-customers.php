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

class WC_POS_API_Customers {

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'pre_user_query', array( $this, 'pre_user_query' ) );
    add_filter( 'woocommerce_api_customer_response', array( $this, 'customer_response' ), 10, 4 );
  }

  /**
   *
   * @param $wp_user_query
   */
  public function pre_user_query( $wp_user_query ) {

    // only target requests from POS
    if( ! is_pos() ) {
      return;
    }

    global $wpdb;
    $term = $wp_user_query->query_vars['search'];

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
      OR LOWER(user_email)
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

    return $wp_user_query;
  }

  /**
   * Returns array of all user ids
   * @return array
   */
  public function get_ids(){
    $args = array(
      'fields' => 'ID'
    );

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
    return $customer_data;
  }

}