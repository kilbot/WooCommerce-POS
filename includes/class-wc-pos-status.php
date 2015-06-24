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

  public function output() {
    $results = array(
      $this->test_wc_version(),
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

  private function test_wc_rest_api() {
    $result = array(
      'title'   => __( 'WC REST API', 'woocommerce-pos' ),
      'message' => __( 'API is active', 'woocommerce-pos' )
    );

    // check wc settings
    if( get_option('woocommerce_api_enabled') !== 'yes' ){
      return array_merge( $result, array(
        'pass'    => false,
        'message' => __( 'Access to the REST API is required', 'woocommerce-pos' ),
        'buttons' => array(
          array(
            'href'  => admin_url('admin.php?page=wc-settings'),
            /* translators: woocommerce */
            'prompt'  => __( 'Enable the REST API', 'woocommerce' )
          )
        )
      ));
    }

    // check permalinks
    $permalinks = get_option('permalink_structure');
    if( empty( $permalinks ) ) {
      return array_merge( $result, array(
        'pass'    => false,
        'message' => __( '<strong>WooCommerce REST API</strong> requires <em>pretty</em> permalinks to work correctly', 'woocommerce-pos' ),
        'buttons' => array(
          array(
            'href'  => admin_url('options-permalink.php'),
            'prompt'  => __( 'Enable permalinks', 'woocommerce-pos' )
          )
        )
      ));
    }

    // check API access
    if( $this->http_status( get_woocommerce_api_url('') ) !== 200 ){
      return array_merge( $result, array(
        'pass'    => false,
        'message' => __( 'Unable to access the REST API', 'woocommerce-pos' ),
        'buttons' => array(
          array(
            'href'  => admin_url('options-permalink.php'),
            'prompt'  => __( 'Save permalinks', 'woocommerce-pos' )
          )
        )
      ));
    }

    // check http methods
    $can_use_restful_methods = $this->use_restful_http_methods();
    $legacy_server_enabled = get_option( 'woocommerce_pos_emulateHTTP' );

    if( !$can_use_restful_methods && !$legacy_server_enabled ){
      return array_merge( $result, array(
        'pass'    => false,
        'message' => __( 'Unable to use RESTful HTTP methods', 'woocommerce-pos' ),
        'buttons' => array(
          array(
            'action'  => 'enable-legacy-server',
            'prompt'  => __( 'Enable legacy server support', 'woocommerce-pos' )
          )
        )
      ));
    }

    if( $can_use_restful_methods && $legacy_server_enabled ) {
      return array_merge( $result, array(
        'pass'    => false,
        'message' => __( 'Legacy server enabled', 'woocommerce-pos' ),
        'buttons' => array(
          array(
            'action'  => 'disable-legacy-server',
            'prompt'  => __( 'Disable legacy server support', 'woocommerce-pos' )
          )
        )
      ));
    }

    return array_merge( $result, array(
      'pass' => true
    ));
  }

  /**
   * Check response from HTTP methods
   * @return bool
   */
  private function use_restful_http_methods(){
    $args = array(
      'action' => 'wc_pos_test_http_methods',
      'security' => wp_create_nonce( WC_POS_PLUGIN_NAME )
    );
    $url = admin_url( 'admin-ajax.php?'. http_build_query( $args ) );
    return $this->http_status( $url, 'PUT' ) === 200 && $this->http_status( $url, 'DELETE' ) === 200;
  }

  /**
   * @param $url
   * @param $method
   * @return bool|int
   */
  private function http_status( $url, $method = 'GET' ){
    $args = array(
      'method' => $method
    );
    $response = wp_remote_request( $url, $args );
    return wp_remote_retrieve_response_code( $response );
  }

  static public function toggle_legacy_server(){
    if( isset($_GET['enable']) && $_GET['enable'] === 'true' ) {
      update_option( 'woocommerce_pos_emulateHTTP', true );
    } else {
      delete_option( 'woocommerce_pos_emulateHTTP' );
    }
  }

}