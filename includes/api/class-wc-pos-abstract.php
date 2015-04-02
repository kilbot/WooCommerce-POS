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

  /**
   * @return string
   */
  protected function get_raw_data() {
    global $HTTP_RAW_POST_DATA;
    if ( !isset( $HTTP_RAW_POST_DATA ) ) {
      $HTTP_RAW_POST_DATA = file_get_contents( 'php://input' );
    }
    return $HTTP_RAW_POST_DATA;
  }

  /**
   * Parse an RFC3339 datetime into a MySQl datetime
   * mirrors woocommerce/includes/api/class-wc-api-server.php
   *
   * @param $datetime
   * @return string
   */
  protected function parse_datetime( $datetime ) {
    // Strip millisecond precision (a full stop followed by one or more digits)
    if ( strpos( $datetime, '.' ) !== false ) {
      $datetime = preg_replace( '/\.\d+/', '', $datetime );
    }
    // default timezone to UTC
    $datetime = preg_replace( '/[+-]\d+:+\d+$/', '+00:00', $datetime );
    try {
      $datetime = new DateTime( $datetime, new DateTimeZone( 'UTC' ) );
    } catch ( Exception $e ) {
      $datetime = new DateTime( '@0' );
    }
    return $datetime->format( 'Y-m-d H:i:s' );
  }

}