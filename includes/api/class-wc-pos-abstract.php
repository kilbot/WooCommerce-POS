<?php

/**
 * Abstract API Class
 *
 * @class    WC_POS_API_Abstract
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

abstract class WC_POS_API_Abstract {

//  /**
//   * @return string
//   */
//  protected function get_raw_data() {
//    global $HTTP_RAW_POST_DATA;
//    if ( !isset( $HTTP_RAW_POST_DATA ) ) {
//      $HTTP_RAW_POST_DATA = file_get_contents( 'php://input' );
//    }
//    return $HTTP_RAW_POST_DATA;
//  }
//
//  /**
//   * @return array|mixed
//   */
//  protected function get_data(){
//    $data = json_decode(trim($this->get_raw_data()), true);
//    // remove status
//    if(is_array($data) && array_key_exists('status', $data)){
//      unset($data['status']);
//    }
//    return $data;
//  }

  /**
   * @param $updated_at_min
   */
  static protected function get_ids($updated_at_min){}

}