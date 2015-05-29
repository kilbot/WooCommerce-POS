<?php
/**
 *
 *
 * @class    WC_POS_Status
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Status {

  private $wc_min_version = '2.2';

  public function tests() {
    $results = array(
      array(
        'title' => __( 'WC Version', 'woocommerce-pos' ),
        'test'  => $this->wc_version_check(),
        'pass'  => esc_html( WC()->version ),
        'fail'  => sprintf( __( 'WooCommerce >= %s required', 'woocommerce-pos' ), $this->wc_min_version),
        'action'=> admin_url('update-core.php'),
        /* translators: wordpress */
        'prompt'=> __( 'Update' ),
      ),
      array(
        'title' => __( 'WC REST API', 'woocommerce-pos' ),
        'test'  => $this->check_api_active(),
        'pass'  => __( 'API is active', 'woocommerce-pos' ),
        'fail'  => __( 'Access to the REST API is required', 'woocommerce-pos' ),
        'action'=> admin_url('admin.php?page=wc-settings'),
        /* translators: woocommerce */
        'prompt'=> __( 'Enable the REST API', 'woocommerce' ),
      )
    );
    return $results;
  }

  /**
   * Test WC >= 2.2
   * @return boolean
   */
  private function wc_version_check() {
    $result = version_compare( WC()->version, $this->wc_min_version ) >= 0 ? true : false;
    return $result;
  }

  /**
   * Check API is active
   * @return boolean
   */
  private function check_api_active() {
    $api_access = false;
    $file_headers = @get_headers( get_woocommerce_api_url( '' ) );
    if( strpos( $file_headers[0], '404 Not Found' ) === false ) {
      $api_access = true;
    }
    return $api_access;
  }

}