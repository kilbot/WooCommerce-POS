<?php

/**
 * POS Customer Class
 * duck punches the WC REST API
 *
 * @class    WC_POS_API_Customers
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\API;

use WC_API_Resource;
use WC_API_Server;
use WP_User_Query;

class Customers extends WC_API_Resource {

  /** @var string $base the route base */
  protected $base = '/customers';

  /* @var map json attribute to postmeta */
  private $usermeta_map = array(
    'first_name'                  => 'first_name',
    'last_name'                   => 'last_name',
    'billing_address.first_name'  => 'billing_first_name',
    'billing_address.last_name'   => 'billing_last_name',
    'billing_address.company'     => 'billing_company',
    'billing_address.address_1'   => 'billing_address_1',
    'billing_address.address_2'   => 'billing_address_2',
    'billing_address.city'        => 'billing_city',
    'billing_address.state'       => 'billing_state',
    'billing_address.postcode'    => 'billing_postcode',
    'billing_address.country'     => 'billing_country',
    'billing_address.email'       => 'billing_email',
    'billing_address.phone'       => 'billing_phone',
    'shipping_address.first_name' => 'shipping_first_name',
    'shipping_address.last_name'  => 'shipping_last_name',
    'shipping_address.company'    => 'shipping_company',
    'shipping_address.address_1'  => 'shipping_address_1',
    'shipping_address.address_2'  => 'shipping_address_2',
    'shipping_address.city'       => 'shipping_city',
    'shipping_address.state'      => 'shipping_state',
    'shipping_address.postcode'   => 'shipping_postcode',
    'shipping_address.country'    => 'shipping_country'
  );

  /* @var map json attribute to postmeta */
  private $user_field_map = array(
    'email'     => 'user_email',
    'username'  => 'user_login'
  );

  /**
   * @param WC_API_Server $server
   */
  public function __construct( WC_API_Server $server ) {
    parent::__construct( $server );
    add_filter( 'woocommerce_api_customer_response', array( $this, 'customer_response' ), 10, 4 );

    if( $server->path === $this->base || $server->path === $this->base . '/ids' ){
      add_action( 'pre_get_users', array( $this, 'pre_get_users' ), 5 );
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
   * Set up the WP_User_Query for POS queries
   *
   * @param WP_User_Query $WP_User_Query
   */
  public function pre_get_users( \WP_User_Query $WP_User_Query ) {

    // prevent infinite loop
    if($WP_User_Query->get('pos_subquery'))
      return;

    // modify query params
    $this->set_customer_roles($WP_User_Query);
    $this->set_customer_order($WP_User_Query);
    $this->set_customer_include_exclude($WP_User_Query);

    // early exit
    $search = $WP_User_Query->get('search');
    if(empty($search))
      return;

    // modify search
    $WP_User_Query->set('search', ''); // remove search

    if( is_string($search) ){
      $this->simple_search( $search, $WP_User_Query );
    }

    elseif( is_array($search) ){
      $this->complex_search( $search, $WP_User_Query );
    }
  }


  /**
   * @param WP_User_Query $WP_User_Query
   */
  private function set_customer_roles(\WP_User_Query $WP_User_Query){
    global $wp_version;

    $WP_User_Query->query_vars[ 'role' ] = '';

    // WordPress 4.4 allows role__in and role__not_in
    if ( version_compare( $wp_version, '4.4', '>=' ) ) {
      $roles = wc_pos_get_option( 'customers', 'customer_roles' );

      if ( is_array( $roles ) && !in_array( 'all', $roles ) ) {
        $WP_User_Query->query_vars[ 'role__in' ] = $roles;
      }

      // special case: no customer roles
      if ( is_null( $roles ) ) {
        // ?
      }
    }
  }


  /**
   * @param WP_User_Query $WP_User_Query
   */
  private function set_customer_order(\WP_User_Query $WP_User_Query) {
    $orderby_params = array(
      'ID',
      'display_name',
      'name',
      'user_name',
      'login',
      'user_login',
      'nicename',
      'user_nicename',
      'email',
      'user_email',
      'url',
      'user_url',
      'registered',
      'user_registered',
      'post_count',
      'meta_value',
      'meta_value_num'
    );

    $orderby = isset($WP_User_Query->query_vars['orderby']) ? $WP_User_Query->query_vars['orderby'] : '';

    if( $orderby && ! in_array($orderby, $orderby_params) ) {
      $WP_User_Query->set('orderby', 'meta_value');
      $WP_User_Query->set('meta_key', $orderby);
    }

  }


  /**
   * @param WP_User_Query $WP_User_Query
   */
  private function set_customer_include_exclude(\WP_User_Query $WP_User_Query){
    if ( isset( $_GET[ 'filter' ] ) ) {

      // add support for filter[in]
      if (isset($_GET['filter']['in'])) {
        $WP_User_Query->set( 'include', explode(',', $_GET['filter']['in'] ) );
      }

      // add support for filter[not_in]
      if (isset($_GET['filter']['not_in'])) {
        $WP_User_Query->set( 'exclude', explode(',', $_GET['filter']['not_in'] ) );
      }
    }
  }


  /**
   * Extends customer search, allows more fields
   *
   * @param $term
   * @param WP_User_Query $WP_User_Query
   */
  private function simple_search($term, \WP_User_Query $WP_User_Query) {

    $fields = isset($_GET['filter']['qFields']) ? $_GET['filter']['qFields'] : array();
    $fields = is_array($fields) ? $fields : array($fields);
    $search_columns = $meta_query = $user_query_ids = $usermeta_query_ids = array();

    foreach($fields as $field){

      // user field search
      if(isset($this->user_field_map[$field])){
        $search_columns[] = $this->user_field_map[$field];
      }

      // usermeta search
      if(isset($this->usermeta_map[$field])){
        $meta_query[] = array(
          'key'     => $this->usermeta_map[$field],
          'value'   => $term,
          'compare' => 'LIKE'
        );
      }

    }

    // user field subquery
    if(!empty($search_columns)){
      $user_query = new WP_User_Query(array(
        'fields' => 'ID',
        'search' => '*' . trim( $term, '*' ) . '*',
        'search_columns' => $search_columns,
        'pos_subquery' => true
      ));
      $user_query_ids = $user_query->get_results();
    }

    // usermeta subquery
    if(!empty($meta_query)) {
      $meta_query['relation'] = 'OR';
      $usermeta_query = new WP_User_Query(array(
        'fields' => 'ID',
        'meta_query' => $meta_query,
        'pos_subquery' => true
      ));
      $usermeta_query_ids = $usermeta_query->get_results();
    }

    $ids = array_merge($user_query_ids, $usermeta_query_ids, $WP_User_Query->get('include'));
    $include = array_diff(array_unique($ids), $WP_User_Query->get('exclude'));

    if(empty($include)){
      $include = array(0);
    }

    $WP_User_Query->set('include', $include);

  }

  /**
   * @param array $queries
   * @param WP_User_Query $WP_User_Query
   */
  private function complex_search(array $queries, \WP_User_Query $WP_User_Query){
    $include = array();

    foreach($queries as $query){
      $type = isset($query['type']) ? $query['type'] : '';
      $term = isset($query['query']) ? $query['query'] : '';

      // string
      if($type == 'string'){
        $this->simple_search($term, $WP_User_Query);
      }

      // prefix
      if($type == 'prefix'){
        $prefix = isset($query['prefix']) ? $query['prefix'] : '';

        // id prefix
        if($prefix == 'id'){
          $include[] = (int) $term;
        }

        // other prefexes?
      }
    };

    $ids = array_merge($include, $WP_User_Query->get('include'));
    $include = array_diff(array_unique($ids), $WP_User_Query->get('exclude'));

    if(empty($include)){
      $include = array(0);
    }

    $WP_User_Query->set('include', $include);

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