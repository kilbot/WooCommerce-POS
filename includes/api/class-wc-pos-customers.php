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
  }

  /**
   * Removes the role='customer' restraint
   * todo: add this option to settings
   * @param $wp_user_query
   */
  public function pre_get_users( $wp_user_query ) {
    $wp_user_query->query_vars['role'] = '';
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
  }

  /**
   * Returns array of all user ids
   * @param $updated_at_min
   * @return array
   */
  static public function get_ids($updated_at_min){
    $args = array(
      'fields' => 'ID'
    );

    $query = new WP_User_Query( $args );
    return array_map( 'intval', $query->results );
  }

}