<?php

/**
 * POS Customer Class
 *
 * @class    WC_POS_Customers
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Customers {

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();
    add_action( 'pre_user_query', array( $this, 'pre_user_query' ) );
  }

  /**
   * Load Customer subclasses
   */
  private function init() {

  }

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
      error_log(print_r($ids_str, true));
      $wp_user_query->query_where = str_replace(
        "user_nicename LIKE '".$term."'",
        "ID IN(".$ids_str.")",
        $wp_user_query->query_where
      );
    }

    return $wp_user_query;
  }

}