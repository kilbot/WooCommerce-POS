<?php

/**
 * Handles the POS Only functionality (optional)
 *
 * @class    WC_POS_Products_Visibility
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\Products;

class Visibility {

  protected $options;

  /**
   * Constructor
   */
  public function __construct() {

    // visibility options
    $this->options = array(
      ''            => __( 'POS & Online', 'woocommerce-pos' ),
      'pos_only'    => __( 'POS Only', 'woocommerce-pos' ),
      'online_only' => __( 'Online Only', 'woocommerce-pos' )
    );

    add_filter( 'posts_where', array( $this, 'posts_where' ), 10 , 2 );
    add_filter( 'views_edit-product', array( $this, 'pos_visibility_filters' ), 10, 1 );
    add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ), 10, 1 );
    add_action( 'bulk_edit_custom_box', array( $this, 'bulk_edit' ), 10, 2 );
    add_action( 'quick_edit_custom_box', array( $this, 'quick_edit'), 10, 2 );
    add_action( 'save_post', array( $this, 'save_post' ), 10, 2 );
    add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
    add_action( 'manage_product_posts_custom_column' , array( $this, 'custom_product_column' ), 10, 2 );
    add_action( 'post_submitbox_misc_actions', array( $this, 'post_submitbox_misc_actions' ), 99 );

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

      $class = ( isset( $_GET['pos_visibility'] ) && $_GET['pos_visibility'] == $key ) ? 'current' : '';
      if( $class == '' ) $query_string = remove_query_arg(array( 'paged' ));
      $query_string = remove_query_arg(array( 'pos_visibility', 'post_status' ));
      $query_string = add_query_arg( 'pos_visibility', urlencode($key), $query_string );
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

  /**
   * @param $column_name
   * @param $post_type
   */
  public function bulk_edit($column_name, $post_type){
    if ( 'name' != $column_name || 'product' != $post_type ) {
      return;
    }
    $options = array_merge(
      array('-1' => '&mdash; No Change &mdash;'), $this->options
    );
    include 'views/quick-edit-visibility-select.php';
  }

  /**
   * @param $column_name
   * @param $post_type
   */
  public function quick_edit($column_name, $post_type){
    if ( 'product_cat' != $column_name || 'product' != $post_type ) {
      return;
    }
    $options =  $this->options;
    include 'views/quick-edit-visibility-select.php';
  }

  /**
   * @param $post_id
   * @param $post
   */
  public function save_post( $post_id, $post ) {

    // If this is an autosave, our form has not been submitted, so we don't want to do anything.
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
      return;
    }

    // Don't save revisions and autosaves
    if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
      return;
    }

    // Check post type is product
    if ( 'product' != $post->post_type ) {
      return;
    }

    // Check user permission
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
      return;
    }

    // Check nonces
    if ( ! isset( $_REQUEST['woocommerce_quick_edit_nonce'] ) &&
      !isset( $_REQUEST['woocommerce_bulk_edit_nonce'] ) &&
      !isset( $_REQUEST['woocommerce_meta_nonce'] ) ) {
      return;
    }
    if ( isset( $_REQUEST['woocommerce_quick_edit_nonce'] ) &&
      !wp_verify_nonce( $_REQUEST['woocommerce_quick_edit_nonce'], 'woocommerce_quick_edit_nonce' ) ) {
      return;
    }
    if ( isset( $_REQUEST['woocommerce_bulk_edit_nonce'] ) &&
      !wp_verify_nonce( $_REQUEST['woocommerce_bulk_edit_nonce'], 'woocommerce_bulk_edit_nonce' ) ) {
      return;
    }
    if ( isset( $_REQUEST['woocommerce_meta_nonce'] ) &&
      !wp_verify_nonce( $_REQUEST['woocommerce_meta_nonce'], 'woocommerce_save_data' ) ) {
      return;
    }

    // Get the product and save
    if ( isset( $_REQUEST['_pos_visibility'] ) ) {
      update_post_meta( $post_id, '_pos_visibility', $_REQUEST['_pos_visibility'] );
    }

  }

  /**
   * @param $hook
   */
  public function admin_enqueue_scripts( $hook ) {
    $pages = array('edit.php', 'post.php', 'post-new.php');
    $screen = get_current_screen();

    if( !in_array( $hook, $pages ) || $screen->post_type != 'product' )
      return;

    if(defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG){
      $script = WC_POS\PLUGIN_URL . 'assets/js/src/products.js';
    } else {
      $script = WC_POS\PLUGIN_URL . 'assets/js/products.min.js';
    }

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-admin-edit',
      $script,
      false,
      WC_POS_VERSION,
      true
    );
  }

  /**
   * @param $column
   * @param $post_id
   */
  public function custom_product_column($column, $post_id) {
    if( $column == 'name'){
      $selected = get_post_meta( $post_id , '_pos_visibility' , true );
      echo '<div class="hidden" id="woocommerce_pos_inline_'. $post_id .'" data-visibility="'. $selected .'"></div>';
    }
  }

  /**
   * Add visibility option to the Product edit page
   */
  public function post_submitbox_misc_actions(){
    global $post;

    if ( 'product' != $post->post_type ) {
      return;
    }

    $selected = get_post_meta( $post->ID , '_pos_visibility' , true );
    if( !$selected ){ $selected = ''; }
    include 'views/post-metabox-visibility-select.php';
  }

}