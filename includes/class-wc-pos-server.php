<?php
/**
 *
 *
 * @class    WC_POS_Server
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Server {

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
  static public function get_raw_data() {
    global $HTTP_RAW_POST_DATA;
    if ( !isset( $HTTP_RAW_POST_DATA ) ) {
      $HTTP_RAW_POST_DATA = trim(file_get_contents('php://input'));
    }
    return json_decode( $HTTP_RAW_POST_DATA, true);
  }

}