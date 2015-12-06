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
   */
  public function __construct() {

    // subclasses
    $params = new WC_POS_AJAX_Params();
    new WC_POS_AJAX_Settings();

    $ajax_events = array(
      'get_all_ids'           => 'WC_POS_API',
      'get_modal'             => $this,
      'email_receipt'         => $this,
      'send_support_email'    => $this,
      'test_http_methods'     => $this,
      'toggle_legacy_server'  => 'WC_POS_Status',
      'params'                => $params,
      'admin_settings_params' => $params
    );

    foreach ( $ajax_events as $ajax_event => $class ) {
      // check_ajax_referer
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $this, 'check_ajax_referer' ), 1 );
      // trigger method
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $class, $ajax_event ) );
    }

  }

  /**
   *
   */
  public function get_modal() {

    if( isset( $_REQUEST['data']) )
      extract( $_REQUEST['data'] );

    include_once( dirname(__FILE__) . '/views/modals/' . $_REQUEST['template'] . '.php' );
    wp_die();
  }

  /**
   * Update POS visibilty option
   */
//  public function set_product_visibilty() {
//
//    if( !isset( $_REQUEST['post_id'] ) )
//      wp_die('Product ID required');
//
//    // security
//    check_ajax_referer( 'set-product-visibilty-'.$_REQUEST['post_id'], 'security' );
//
//    // set the post_meta field
//    if( update_post_meta( $_REQUEST['post_id'], '_pos_visibility', $_REQUEST['_pos_visibility'] ) ) {
//      $post_modified     = current_time( 'mysql' );
//      $post_modified_gmt = current_time( 'mysql', 1 );
//      wp_update_post( array(
//        'ID'        => $_REQUEST['post_id'],
//        'post_modified'   => $post_modified,
//        'post_modified_gmt' => $post_modified_gmt
//      ));
//      $result = array('success' => true);
//    }
//    else {
//      wp_die('Failed to update post meta table');
//    }
//
//    $this->serve_response($result);
//  }

  /**
   * Send email receipt
   */
  public function email_receipt() {
    $order_id = isset($_REQUEST['order_id']) ? $_REQUEST['order_id'] : '';
    $email    = isset($_REQUEST['email']) ? $_REQUEST['email'] : '';
    $order    = wc_get_order( absint( $order_id ) );
    if( is_object( $order ) ) {
      if( $email != '' ){
        $order->billing_email = $email;
      }
      WC()->mailer()->customer_invoice( $order );
      $response = array(
        'result' => 'success',
        'message' => __( 'Email sent', 'woocommerce-pos')
      );

      // hook for third party plugins
      do_action( 'woocommerce_pos_email_receipt', $email, $order_id, $order );
    } else {
      $response = array(
        'result' => 'error',
        'message' => __( 'There was an error sending the email', 'woocommerce-pos')
      );
    }
    self::response($response);
  }

  /**
   *
   */
  public function send_support_email() {
    $headers[]  = 'From: '. $_POST['name'] .' <'. $_POST['email'] .'>';
    $headers[]  = 'Reply-To: '. $_POST['name'] .' <'. $_POST['email'] .'>';
    $message    = $_POST['message'] . "\n\n" . $_POST['status'];
    $support    = apply_filters( 'woocommerce_pos_support_email', 'support@woopos.com.au' );

    if( wp_mail( $support, 'WooCommerce POS Support', $message, $headers ) ) {
      $response = array(
        'result' => 'success',
        'message' => __( 'Email sent', 'woocommerce-pos')
      );
    } else {
      $response = array(
        'result' => 'error',
        'message' => __( 'There was an error sending the email', 'woocommerce-pos')
      );
    }

    self::response($response);
  }

  /**
   * Returns payload for any request for testing
   */
  public function test_http_methods(){
    self::response( array(
      'method' => strtolower($_SERVER['REQUEST_METHOD']),
      'payload' => WC_POS_Server::get_raw_data()
    ));
  }

  /**
   * Returns system status JSON array
   */
  public function system_status(){
    $status = new WC_POS_Status();
    self::response( $status->output() );
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
      self::response($result);
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
  static public function response($result){

    header( 'Content-Type: application/json; charset=utf-8' );

    if (is_wp_error($result)) {
      $data = $result->get_error_data();
      if ( is_array( $data ) && isset( $data['status'] ) ) {
        status_header( $data['status'] );
      }
      $result = self::error_to_array( $result );
    }

    echo json_encode( $result );
    wp_die();
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

}