<?php

/**
 * POS Settings
 *
 * @class    WC_POS_API_Settings
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

class WC_POS_API_Settings extends WC_API_Resource {

  protected $base = '/pos/settings';

  /* @var string The db prefix for WP Options table */
  const DB_PREFIX = 'woocommerce_pos_';

  /**
   * Register routes for POS Settings
   *
   * GET /pos
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( array $routes ) {

    # GET /pos/settings
    $routes[ $this->base ] = array(
      array( array( $this, 'get_settings' ), WC_API_Server::READABLE )
    );

    # GET|PUT|DELETE /pos/settings/<id>
    $routes[ $this->base . '/(?P<id>\w+)' ] = array(
      array( array( $this, 'get_settings' ),  WC_API_Server::READABLE ),
      array( array( $this, 'edit_settings' ), WC_API_Server::EDITABLE | WC_API_Server::ACCEPT_DATA ),
      array( array( $this, 'delete_settings' ), WC_API_Server::DELETABLE ),
    );

    return $routes;

  }

  /**
   * @param string $id
   * @return array
   */
  public function get_settings( $id = '', $wc_pos_admin = null ){
    $payload = $handlers = array();

    switch ($wc_pos_admin) {
      case 'admin_settings':
        $handlers = WC_POS_Admin_Settings::handlers();
        break;
      case 'admin_system_status':
        $handlers = WC_POS_Admin_Status::handlers();
        break;
    }

    // single settings
    if( $id && isset( $handlers[$id] ) ){
      $handler = $handlers[$id];
      return $this->get_setting( $handler::get_instance() );
    }

    foreach($handlers as $key => $handler){
      $payload[] = $this->get_setting( $handler::get_instance() );
    }

    return $payload;
  }

  /**
   * @param $handler
   * @return array
   */
  private function get_setting( $handler ) {
    return array(
      'id'       => $handler->id,
      'label'    => $handler->label,
      'data'     => $handler->get(),
      'template' => $handler->get_template()
    );
  }

  /**
   * @param string $id
   * @return array|WP_Error
   */
  public function edit_settings( $id = '' ){

    $handler = $this->get_settings_handler( $id );

    if ( is_wp_error( $handler ) ) {
      return $handler;
    }

    // todo bump idbVersion

    return $handler->set( WC_POS_API::get_raw_data() );
  }


  /**
   * @param string $id
   * @return array|WP_Error
   */
  public function delete_settings( $id = '' ){

    $handler = $this->get_settings_handler( $id );

    if ( is_wp_error( $handler ) ) {
      return $handler;
    }

    // todo bump idbVersion

    return $handler->delete();
  }


  private function get_settings_handler( $id ){

    if( ! $id ){
      return new WP_Error(
        'woocommerce_pos_settings_error',
        __( 'There is no settings id', 'woocommerce-pos' ),
        array( 'status' => 400 )
      );
    }

    // special case: gateway_
    $gateway_id = preg_replace( '/^gateway_/', '', strtolower( $id ), 1, $count );
    if($count) {
      return new WC_POS_Admin_Settings_Gateways( $gateway_id );
    }

    // else, find handler by id
    else {
      $handlers = (array) WC_POS_Admin_Settings::handlers();
      if( isset( $handlers[$id] ) )
        return new $handlers[$id]();
    }

    return new WP_Error(
      'woocommerce_pos_settings_error',
      sprintf( __( 'No handler found for %s settings', 'woocommerce-pos' ), $id),
      array( 'status' => 400 )
    );

  }

}