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

class WC_POS_APIv2_Customers extends WC_POS_API_Abstract {

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'pre_get_users', array( $this, 'pre_get_users' ) );
    add_action( 'pre_user_query', array( $this, 'pre_user_query' ) );
    add_filter( 'woocommerce_rest_prepare_customer', array( $this, 'customer_response' ), 10, 3 );
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
   * @param $date_modified
   * @return array
   */
  public function get_ids($date_modified){
    $args = array(
      'fields' => 'ID'
    );

    if($date_modified){
      $args['meta_key']      = '_user_modified_gmt';
      $args['meta_value']    = $this->parse_datetime( $date_modified );
      $args['meta_compare']  = '>';
    }

    $query = new WP_User_Query( $args );
    return array_map( 'intval', $query->results );
  }


  /**
   *
   *
   * @param WP_REST_Response $response   The response object.
   * @param WP_User          $user_data  User object used to create response.
   * @param WP_REST_Request  $request    Request object.
   * @return array
   */
  public function customer_response( $response, $user_data, $request  ){
    $data = $response->get_data();

    // backwards compat
    if( isset($data['date_modified']) ) {
      $data['updated_at'] = $data['date_modified'];
    }

    if( isset($data['billing']) ) {
      $data['billing_address'] = $data['billing'];
    }

    if( isset($data['shipping']) ) {
      $data['shipping_address'] = $data['shipping'];
    }

    $response->set_data($data);
    return $response;
  }


}