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

  private $wc_min_version = '2.3';
  private $php_min_version = '5.4';

  public function output() {
    $results = array(
      $this->test_wc_version(),
      $this->test_php_version(),
      $this->test_wc_rest_api()
    );
    return $results;
  }

  /**
   * Test WC >= $wc_min_version
   * @return boolean
   */
  private function test_wc_version() {
    $result = array(
      'title'   => __( 'WC Version', 'woocommerce-pos' ),
      'pass'    => version_compare( WC()->version, $this->wc_min_version, '>=' ),
      'message' => esc_html( WC()->version )
    );

    if( ! $result['pass'] ){
      $result = array_merge( $result, array(
        'message' => sprintf( __( 'WooCommerce >= %s required', 'woocommerce-pos' ), $this->wc_min_version),
        'buttons' => array(
          array(
            'href'  => admin_url( 'update-core.php' ),
            /* translators: wordpress */
            'prompt'  => __( 'Update' )
          )
        )
      ));
    }

    return $result;
  }

  /**
   * Test PHP >= $php_min_version
   * @return boolean
   */
  private function test_php_version() {
    if( ! function_exists('phpversion') )
      return;

    $php_version = phpversion();

    $result = array(
      'title'   => /* translators: woocommerce */ __( 'PHP Version', 'woocommerce' ),
      'pass'    => version_compare( $php_version, $this->php_min_version, '>' ),
      'message' => esc_html( $php_version )
    );

    if( ! $result['pass'] ){
      $result = array_merge( $result, array(
        'message' => sprintf( __( 'PHP >= %s required', 'woocommerce-pos' ), $this->php_min_version ),
        'buttons' => array(
          array(
            'href'  => 'http://docs.woothemes.com/document/how-to-update-your-php-version/',
            /* translators: wordpress */
            'prompt'  => __( 'Update' )
          )
        )
      ));
    }

    return $result;
  }

  /**
   * Test WC REST API is accessible using RESTful HTTP methods
   * @return array
   */
  private function test_wc_rest_api() {
    $result = array(
      'pass'    => true,
      'title'   => __( 'WC REST API', 'woocommerce-pos' ),
      'message' => __( 'API is active', 'woocommerce-pos' )
    );

    if( $fail = self::permalinks_disabled() )
      return array_merge( $result, $fail );

    if( $fail = self::wc_rest_api_disabled() )
      return array_merge( $result, $fail );

    return $result;
  }

  /**
   * Option for to emulate RESTful HTTP requests
   */
  static public function toggle_legacy_server(){
    if( isset($_GET['enable']) && $_GET['enable'] === 'true' ) {
      update_option( 'woocommerce_pos_emulateHTTP', true );
    } else {
      delete_option( 'woocommerce_pos_emulateHTTP' );
    }
  }

  /**
   * @return array
   */
  static public function wc_rest_api_disabled(){
    if( get_option('woocommerce_api_enabled') !== 'yes' ) {

      // api settings changes in WC 2.4
      $href = admin_url('admin.php?page=wc-settings');
      if( version_compare( WC()->version, '2.4', '>=' ) ){
        $href .= '&tab=api';
      }

      return array(
        'pass' => false,
        'message' => __('Access to the REST API is required', 'woocommerce-pos'),
        'buttons' => array(
          array(
            'href' => $href,
            /* translators: woocommerce */
            'prompt' => __('Enable the REST API', 'woocommerce')
          )
        )
      );
    }
  }

  /**
   * @return array
   */
  static public function permalinks_disabled(){
    if( empty( get_option('permalink_structure') ) ) {
      return array(
        'pass'    => false,
        'message' => __( '<strong>WooCommerce REST API</strong> requires <em>pretty</em> permalinks to work correctly', 'woocommerce-pos' ),
        'buttons' => array(
          array(
            'href'  => admin_url('options-permalink.php'),
            'prompt'  => __( 'Enable permalinks', 'woocommerce-pos' )
          )
        )
      );
    }
  }

}