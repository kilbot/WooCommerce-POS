<?php

/**
 * POS Payload
 *
 * @class    WC_POS_API_Payload
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\API;

use WC_REST_Controller;
use WP_REST_Server;

class Payload extends WC_REST_Controller {

  /* Use same namespace as WooCommerce */
  protected $namespace = 'wc/v2';

  /* /pos endpoint */
  protected $rest_base = 'pos';

  /* reference to all API controllers */
  private $controllers;


  /**
   *
   */
  public function __construct( array $controllers ) {
    $this->controllers = $controllers;
  }


  /**
   * Register routes for POS Params
   *
   * GET /pos
   */
  public function register_routes() {

    register_rest_route( $this->namespace, '/' . $this->rest_base, array(
      array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => array( $this, 'get_items' ),
        'permission_callback' => array( $this, 'get_items_permissions_check' ),
      )
    ) );

  }


  /**
   *
   */
  public function get_items( $wc_pos_admin ) {

    $payload = array(
      'i18n'      => $this->controllers['i18n']->get_items(),
      'params'    => $this->controllers['params']->get_items(),
      'templates' => $this->controllers['templates']->get_items(),
    );

    if( $wc_pos_admin ){
      $payload['params']['settings'] = $this->controllers['settings']->get_items( '', $wc_pos_admin );
    } else {
      $payload['params']['gateways'] = $this->controllers['gateways']->get_items();
    }

    return $payload;

  }


  /**
   * Permissions check
   * note: current_user_can is not available here?
   *
   * @param \WP_REST_Request $request
   * @return bool|\WP_Error
   */
  public function get_items_permissions_check ( $request ) {
    global $current_user;
    get_currentuserinfo();

    if( ! user_can( $current_user->ID, 'access_woocommerce_pos' ) )
      return new \WP_Error(
        'woocommerce_pos_authentication_error',
        __( 'User not authorized to access WooCommerce POS', 'woocommerce-pos' ),
        array( 'status' => 401 )
      );

    return true;
  }

}