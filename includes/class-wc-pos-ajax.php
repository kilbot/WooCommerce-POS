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
   * @param WC_POS_API $api
   */
  public function __construct(WC_POS_i18n $i18n, WC_POS_API $api) {

    $ajax_events = array(
      'get_all_ids'           => $api,
      'get_modal'             => $this,
      'get_print_template'    => $this,
      'set_product_visibilty' => $this,
      'email_receipt'         => $this,
      'admin_settings'        => $this,
      'send_support_email'    => $this,
      'update_translations'   => $i18n
    );

    foreach ( $ajax_events as $ajax_event => $class ) {
      // check_ajax_referer
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $this, 'check_ajax_referer' ), 1 );
      // trigger method
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $class, $ajax_event ) );
    }
  }

//  /**
//   * Get all the ids for a given post_type
//   * @return json
//   */
//  public function get_all_ids() {
//
//    if(empty( $_REQUEST['type'] )) {
//      die();
//    }
//
//    $args = array(
//      'post_type'     => array('product'),
//      'post_status'   => array('publish'),
//      'posts_per_page'=>  -1,
//      'fields'        => 'ids'
//    );
//
//    $query = new WP_Query( $args );
//    $ids = array_map( 'intval', $query->posts );
//
//    $this->serve_response($ids);
//  }

  public function get_modal() {

    if( isset( $_REQUEST['data']) )
      extract( $_REQUEST['data'] );

    include_once( dirname(__FILE__) . '/views/modals/' . $_REQUEST['template'] . '.php' );
    die();
  }

  public function get_print_template() {

    // check for custom template
    $template_path_theme = '/woocommerce-pos/';
    $template_path_plugin = WC_POS()->plugin_path. 'public/views/print/';

    wc_get_template( $_REQUEST['template'] . '.php', null, $template_path_theme, $template_path_plugin );

    die();
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
      $result = array('success' => true);
    }
    else {
      wp_die('Failed to update post meta table');
    }

    $this->serve_response($result);
  }

  /**
   * POS Settings stored in options table
   */
  public function admin_settings() {
    $result = $this->process_admin_settings();
    $this->serve_response($result);
  }

  private function process_admin_settings(){
    // validate
    if(!isset($_GET['id']))
      return new WP_Error(
        'woocommerce_pos_settings_error',
        __( 'There is no settings id', 'woocommerce-pos' ),
        array( 'status' => 401 )
      );

    // init relevant handler
    $id = $_GET['id'];
    $handlers = (array) apply_filters( 'woocommerce_pos_settings_handlers', WC_POS_Admin_Settings::$handlers);
    if(!isset($handlers[$id]))
      return new WP_Error(
        'woocommerce_pos_settings_error',
        sprintf( __( 'No handler found for %s settings', 'woocommerce-pos' ), $_GET['id']),
        array( 'status' => 401 )
      );

    $handler = new $handlers[$id]();
    $method = strtolower($_SERVER['REQUEST_METHOD']);

    // get
    if( $method === 'get' ) {
      return $handler->get_data();
    }

    // set
    if( $method === 'post' || $method === 'put' ) {
      $data = $this->get_raw_data();
      return $handler->save($data);
    }

    return new WP_Error(
      'woocommerce_pos_cannot_{$method}_{$id}',
      __( 'Settings error', 'woocommerce-pos' ),
      array( 'status' => 401 )
    );
  }

  public function email_receipt() {

    //
    $response = '';

    $this->json_headers();
    echo json_encode( $response );
    die();
  }

  public function send_support_email() {

    $headers[] = 'From: '. $_POST['payload']['name'] .' <'. $_POST['payload']['email'] .'>';
    $message = print_r( $_POST['payload'], true );
    if( wp_mail( 'support@woopos.com.au', 'WooCommerce POS Support', $message, $headers ) ) {
      $result['success'] = __( 'Email sent!', 'woocommerce-pos' );
    } else {
      $result = new WP_Error(
        'woocommerce_pos_mail_error',
        __( 'Error sending email', 'woocommerce-pos' ),
        array( 'status' => 401 )
      );
    }

    $this->serve_response($result);
  }

  /**
   * Verifies the AJAX request
   */
  public function check_ajax_referer(){
    $pass = check_ajax_referer( WC_POS_PLUGIN_NAME, 'security', false );
    if(!$pass){
      $result = new WP_Error(
        'woocommerce_pos_invalid_nonce',
        __( 'Invalid security nonce', 'woocommerce-pos' ),
        array( 'status' => 401 )
      );
      $this->serve_response($result);
    }
  }

  /**
   * The below functions closely resemble output from the WC REST API
   * This keeps response handling in the POS somewhat consistent
   * between API and AJAX calls
   *
   * Output the result
   * @param $result
   */
  static public function serve_response($result){

    header( 'Content-Type: application/json; charset=utf-8' );

    if (is_wp_error($result)) {
      $data = $result->get_error_data();
      if ( is_array( $data ) && isset( $data['status'] ) ) {
        status_header( $data['status'] );
      }
      $result = self::error_to_array( $result );
    }

    echo json_encode( $result );
    die();
  }

  /**
   * Convert wp_error to array
   * @param $error
   * @return array
   */
  static private function error_to_array( $error ) {
    $errors = array();
    foreach ( (array) $error->errors as $code => $messages ) {
      foreach ( (array) $messages as $message ) {
        $errors[] = array( 'code' => $code, 'message' => $message );
      }
    }
    return array( 'errors' => $errors );
  }

  /**
   * Raw payload
   * @return array|mixed|string
   */
  private function get_raw_data() {
    global $HTTP_RAW_POST_DATA;
    if ( !isset( $HTTP_RAW_POST_DATA ) ) {
      $HTTP_RAW_POST_DATA = json_decode(trim(file_get_contents('php://input')), true);
    }
    return $HTTP_RAW_POST_DATA;
  }

}