<?php

/**
 * Handles the POS Only functionality (optional)
 *
 * @class    WC_POS_Products_Visibility
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Products_Visibility {

  protected $options;

  /**
   * Constructor
   */
  public function __construct() {
    $this->options = array(
      'pos_and_online'  => __( 'POS & Online', 'woocommerce-pos' ),
      'pos_only'        => __( 'POS Only', 'woocommerce-pos' ),
      'online_only'     => __( 'Online Only', 'woocommerce-pos' )
    );

    add_filter( 'posts_where', array( $this, 'posts_where' ), 10 , 2 );
    add_filter( 'views_edit-product', array( $this, 'pos_visibility_filters' ), 10, 1 );
    add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ), 10, 1 );
    add_action( 'bulk_edit_custom_box', array( $this, 'edit_box' ), 10, 2 );
    add_action( 'quick_edit_custom_box', array( $this, 'edit_box'), 10, 2 );
  }

  /**
   * Show/hide POS products
   *
   * @param $where
   * @param $query
   *
   * @return string
   */
  public function posts_where( $where, $query ) {
    global $wpdb;

    // only alter product queries
    if( is_array( $query->get('post_type') ) && !in_array( 'product', $query->get('post_type') ) )
      return $where;

    if( !is_array( $query->get('post_type') ) && $query->get('post_type') !== 'product' )
      return $where;

    // don't alter product queries in the admin
    if( is_admin() && !is_pos() )
      return $where;

    // hide products
    if( is_pos() ) {
      $hide = 'online_only';
    } else {
      $hide = 'pos_only';
    }

    $where .= " AND ID NOT IN (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_pos_visibility' AND meta_value = '$hide')";

    return $where;

  }

  /**
   * Admin filters for POS / Online visibility
   *
   * @param  array $views
   *
   * @return array
   */
  public function pos_visibility_filters( $views ) {
    global $wpdb;

    $visibility_filters = array(
      // 'pos_and_online' => __( 'POS & Online', 'woocommerce-pos' ),
      'pos_only' => __( 'POS Only', 'woocommerce-pos' ),
      'online_only' => __( 'Online Only', 'woocommerce-pos' )
    );

    if ( isset( $_GET['pos_visibility'] ) && !empty( $_GET['pos_visibility'] ) ) {
      $views['all'] = str_replace( 'class="current"', '', $views['all'] );
    }

    foreach( $visibility_filters as $key => $label ) {

      $sql = "SELECT count(DISTINCT pm.post_id)
      FROM $wpdb->postmeta pm
      JOIN $wpdb->posts p ON (p.ID = pm.post_id)
      WHERE pm.meta_key = '_pos_visibility'
      AND pm.meta_value = '$key'
      AND p.post_type = 'product'
      AND p.post_status = 'publish'
      ";
      $count = $wpdb->get_var($sql);

      $class 			= ( isset( $_GET['pos_visibility'] ) && $_GET['pos_visibility'] == $key ) ? 'current' : '';
      if( $class == '' ) $query_string = remove_query_arg(array( 'paged' ));
      $query_string 	= remove_query_arg(array( 'pos_visibility', 'post_status' ));
      $query_string 	= add_query_arg( 'pos_visibility', urlencode($key), $query_string );
      $views[$key] 	= '<a href="'. $query_string . '" class="' . esc_attr( $class ) . '">' . $label . ' <span class="count">(' . number_format_i18n( $count ) . ')</a></a>';
    }

    return $views;
  }

  /**
   * Filter the results on the products admin page
   *
   * @param $query
   */
  public function pre_get_posts( $query ) {

    // product page
    if ( is_admin() && get_query_var( 'post_type' ) == 'product' ) {

      if ( isset( $_GET['pos_visibility'] ) && ! empty( $_GET['pos_visibility'] ) ) {
        $meta_query = array(
          array(
            'key'     => '_pos_visibility',
            'value'   => $_GET['pos_visibility'],
            'compare' => '=='
          )
        );

        $query->set( 'meta_query', $meta_query );
      }
    }

  }

  public function edit_box($column_name, $post_type){
    if($post_type == 'product' && $column_name == 'name'){
      include 'views/quick-edit.php';
    }
  }

}