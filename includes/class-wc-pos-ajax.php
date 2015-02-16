<?php

/**
 * AJAX Event Handler
 *
 * Handles the ajax
 *
 * @class     WC_POS_AJAX
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_AJAX {

  /**
   * Hook into ajax events
   *
   * @param WC_POS_i18n $i18n
   */
  public function __construct(WC_POS_i18n $i18n) {

    $this->i18n = $i18n;

    // woocommerce_EVENT => nopriv
    $ajax_events = array(
      'process_order'         => false,
      'get_all_ids'           => false,
      'get_modal'             => false,
      'json_search_customers' => false,
      'set_product_visibilty' => false,
      'email_receipt'         => false,
      'get_print_template'    => false,
      'admin_settings'        => false,
      'send_support_email'    => false,
      'update_translations'   => false
    );

    foreach ( $ajax_events as $ajax_event => $nopriv ) {
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $this, $ajax_event ) );

      if ( $nopriv )
        add_action( 'wp_ajax_nopriv_wc_pos_' . $ajax_event, array( $this, $ajax_event ) );
    }
  }


  /**
   * Process the order
   * TODO: validation
   * @return json
   */
  public function process_order() {

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    // if there is no cart, there is nothing to process!
    if( empty( $_REQUEST['line_items'] ) )
      wp_die('There are no cart items');

    // create order
    WC_POS()->is_pos = true;
    $response = WC_POS()->checkout->create_order();

    $this->json_headers();
    echo json_encode( $response );

    die();
  }

  public function email_receipt() {

    // security
    check_ajax_referer( 'woocommerce-pos', 'security' );

    // update order with email
    $response = WC_POS()->checkout->email_receipt();

    $this->json_headers();
    echo json_encode( $response );
    die();
  }

  /**
   * Get all the ids for a given post_type
   * @return json
   */
  public function get_all_ids() {

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    if(empty( $_REQUEST['type'] )) {
      die();
    }

    $args = array(
      'post_type'     => array('product'),
      'post_status'   => array('publish'),
      'posts_per_page'=>  -1,
      'fields'        => 'ids'
    );

    $query = new WP_Query( $args );
    $ids = array_map( 'intval', $query->posts );

    $this->json_headers();
    echo json_encode( $ids );
    die();
  }

  public function get_modal() {

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    if( isset( $_REQUEST['data']) )
      extract( $_REQUEST['data'] );

    include_once( dirname(__FILE__) . '/views/modals/' . $_REQUEST['template'] . '.php' );
    die();
  }

  public function get_print_template() {

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    // check for custom template
    $template_path_theme = '/woocommerce-pos/';
    $template_path_plugin = WC_POS()->plugin_path. 'public/views/print/';

    wc_get_template( $_REQUEST['template'] . '.php', null, $template_path_theme, $template_path_plugin );

    die();
  }

  /**
   * Search for customers and return json
   * based on same method in woocommerce/includes/class-wc-ajax.php
   * with a few changes to display more info
   */
  public function json_search_customers() {

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    $term = wc_clean( stripslashes( $_GET['term'] ) );

    if ( empty( $term ) ) {
      die();
    }

    // get the default customer
    $customer_id  = get_option( 'woocommerce_pos_default_customer', 0 );
    $default    = get_userdata( $customer_id );
    if( ! $default ) {
      $default = new WP_User(0);

      // $default->first_name = __( 'Guest', 'woocommerce-pos' );
      //
      // using init() because __set throws a warning if WP_DEBUG true
      $data = array(
        'ID'      => 0,
        'first_name'  => __( 'Guest', 'woocommerce-pos' )
      );
      $default->init( (object)$data );
    }

    add_action( 'pre_user_query', array( __CLASS__, 'json_search_customer_name' ) );

    // query the users table
    $customers_query = new WP_User_Query( apply_filters( 'woocommerce_pos_json_search_customers_query', array(
      'fields'         => 'all',
      'orderby'        => 'display_name',
      'search'         => '*' . $term . '*',
      'search_columns' => array( 'ID', 'user_login', 'user_email', 'user_nicename' ),
    ) ) );

    remove_action( 'pre_user_query', array( __CLASS__, 'json_search_customer_name' ) );

    // merge the two results
    $customers = $customers_query->get_results();

    // add the default customer to the results
    array_unshift( $customers, $default );

    foreach ( $customers as $customer ) {

      // use id as key to return unique array
      $found_customers[$customer->ID] = array(
        'id'      => $customer->ID,
        'display_name'  => $customer->display_name,
        'first_name'  => $customer->first_name,
        'last_name'   => $customer->last_name,
        'user_email'  => sanitize_email( $customer->user_email ),
      );
    }

    $this->json_headers();
    echo json_encode( $found_customers );
    die();
  }

  public static function json_search_customer_name( $query ) {
    global $wpdb;

    $term = wc_clean( stripslashes( $_GET['term'] ) );
    if ( method_exists( $wpdb, 'esc_like' ) ) {
      $term = $wpdb->esc_like( $term );
    } else {
      $term = like_escape( $term );
    }

    $query->query_from  .= " INNER JOIN {$wpdb->usermeta} AS user_name ON {$wpdb->users}.ID = user_name.user_id AND ( user_name.meta_key = 'first_name' OR user_name.meta_key = 'last_name' ) ";
    $query->query_where .= $wpdb->prepare( " OR user_name.meta_value LIKE %s ", '%' . $term . '%' );
  }

  /**
   * Update POS visibilty option
   */
  public function set_product_visibilty() {

    if( !isset( $_REQUEST['post_id'] ) )
      wp_die('Product ID required');

    // security
    check_ajax_referer( 'set-product-visibilty-'.$_REQUEST['post_id'], 'security' );

    // set the post_meta field
    if( update_post_meta( $_REQUEST['post_id'], '_pos_visibility', $_REQUEST['_pos_visibility'] ) ) {
      $post_modified     = current_time( 'mysql' );
      $post_modified_gmt = current_time( 'mysql', 1 );
      wp_update_post( array(
        'ID'        => $_REQUEST['post_id'],
        'post_modified'   => $post_modified,
        'post_modified_gmt' => $post_modified_gmt
      ));
      $response = array('success' => true);
    }
    else {
      wp_die('Failed to update post meta table');
    }

    $this->json_headers();
    echo json_encode( $response );
    die();
  }

  /**
   * POS Settings stored in options table
   */
  public function admin_settings() {
    $response = '';

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    // validate
    if( ! isset( $_GET['id'] ) )
      wp_die('There is no option id');

    $method = $_SERVER['REQUEST_METHOD'];
    if( $method === 'POST' || $method === 'PUT' ) {
      $data = json_decode(trim(file_get_contents('php://input')), true);
      $response = WC_POS_Admin_Settings::save_settings(false, $data);
    } elseif( $method === 'GET' ) {
      $response = WC_POS_Admin_Settings::get_settings( $_GET['id'] );
    }

    $this->json_headers();
    echo json_encode( $response );
    die();
  }

  public function send_support_email() {

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    $headers[] = 'From: '. $_POST['payload']['name'] .' <'. $_POST['payload']['email'] .'>';
    $message = print_r( $_POST['payload'], true );
    if( wp_mail( 'support@woopos.com.au', 'WooCommerce POS Support', $message, $headers ) ) {
      $response = 'success';
    } else {
      $response = 'error';
    }

    $this->json_headers();
    echo json_encode( $response );
    die();
  }

  public function update_translations(){

    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    header("Content-Type: text/event-stream");
    header("Cache-Control: no-cache");
    header("Access-Control-Allow-Origin: *");

    echo ":" . str_repeat(" ", 2048) . PHP_EOL; // 2 kB padding for IE

    $this->i18n->manual_update();

    die();
  }

  /**
   * Output headers for JSON requests
   */
  private function json_headers() {
    header( 'Content-Type: application/json; charset=utf-8' );
  }

}