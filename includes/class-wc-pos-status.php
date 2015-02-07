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

  /** @var string Contains auth response */
  public $auth_response;

  public function getTestResults() {
    $results = array(
      array(
        'title' => __( 'WooCommerce Version', 'woocommerce-pos' ),
        'test'  => $this->wc_version_check(),
        'pass'  => esc_html( WC()->version ),
        'fail'  => __( 'WooCommerce >= 2.2 required', 'woocommerce-pos' ),
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
        /* translators: woocommerce-admin */
        'prompt'=> __( 'Enable the REST API', 'woocommerce-admin' ),
      ),
      array(
        'title' => __( 'API Authentication', 'woocommerce-pos' ),
        'test'  => $this->check_api_auth(),
        'pass'  => __( 'Authentication Passed', 'woocommerce-pos' ) . ' <a href="#" class="toggle"><i class="icon icon-info-circle"></i></a><textarea readonly="readonly" class="small form-control" style="display:none">' . $this->auth_response . '</textarea>',
        'fail'  => __( 'Authentication Failed', 'woocommerce-pos' ) . ' <a href="#" class="toggle"><i class="icon icon-info-circle"></i></a><textarea readonly="readonly" class="small form-control" style="display:none">' . $this->auth_response . '</textarea>',
      ),
      array(
        'title' => __( 'Allow URL fopen', 'woocommerce-pos' ),
        'test'  => ini_get('allow_url_fopen'),
        'pass'  => __( 'allow_url_fopen enabled', 'woocommerce-pos' ),
        'fail'  => __( 'allow_url_fopen disabled', 'woocommerce-pos' ),
      ),
    );
    return $results;
  }

  /**
   * Test WC >= 2.2
   * @return boolean
   */
  public function wc_version_check() {
    $result = version_compare( WC()->version, '2.2.0' ) >= 0 ? true : false;
    return $result;
  }

  /**
   * Check API is active
   * @return boolean
   */
  public function check_api_active() {
    $api_access = false;
    $file_headers = @get_headers( get_woocommerce_api_url( '' ) );
    if( strpos( $file_headers[0], '404 Not Found' ) === false ) {
      $api_access = true;
    }
    return $api_access;
  }

  /**
   * Check WC REST API authentication
   * Note: this will not pass the cookie authentication
   * @return boolean
   */
  public function check_api_auth() {
    $api_auth = false;

    $user = apply_filters( 'woocommerce_api_check_authentication', null, $this );

    if( get_class( $user ) == 'WP_User' ) {
      $user_info = array(
        'user_login' => $user->user_login,
        'roles'    => $user->roles,
        'read_private_products' => isset( $user->allcaps['read_private_products'] ) ? $user->allcaps['read_private_products'] : '' ,
        'manage_woocommerce_pos' => isset( $user->allcaps['manage_woocommerce_pos'] ) ? $user->allcaps['manage_woocommerce_pos'] : '' ,
      );
      if( $user_info['read_private_products'] && $user_info['manage_woocommerce_pos'] )
        $api_auth = true;

      $this->auth_response = print_r( $user_info, true );

    } else {

      $this->auth_response = 'WP_Error';
    }

    return $api_auth;
  }

}