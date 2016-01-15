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
   * @param null   $wc_pos_admin
   * @return array
   *
   * @todo refactor, get_settings returns payload, edit_settings returns data
   * @todo move business logic to WC_POS_Admin_Settings?
   */
  public function get_settings( $id = '', $wc_pos_admin = null, $defaults = false ){

    // @todo remove this special hack for 'restore default settings'
    if( $defaults ){
      return $this->delete_settings( $id );
    }

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
      $class = $handlers[$id];
      $handler = $class::get_instance();
      return $handler->get_payload();
    }

    foreach($handlers as $key => $class){
      $handler = $class::get_instance();
      $payload[] = $handler->get_payload();
    }

    return $payload;
  }

  /**
   * @param string $id
   * @param        $data
   * @return array|WP_Error
   * @throws WC_API_Exception
   */
  public function edit_settings( $id = '', $data ){

    if( !$data ){
      throw new WC_API_Exception( 'woocommerce_pos_api_missing_settings_data', sprintf( __( 'No %1$s data specified to edit %1$s', 'woocommerce' ), 'settings' ), 400 );
    }

    $handler = $this->get_settings_handler( $id );

    if ( is_wp_error( $handler ) ) {
      return $handler;
    }

    if( $handler->flush_local_data($data) ){
      WC_POS_Admin_Settings::bump_idb_version();
    }

    return $handler->set( $data );
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

    if( $handler->flush_local_data() ){
      WC_POS_Admin_Settings::bump_idb_version();
    }

    return $handler->delete();
  }

  /**
   * Delete all settings in WP options table
   */
  public function delete_all_settings() {
    global $wpdb;
    $wpdb->query(
      $wpdb->prepare( "
        DELETE FROM {$wpdb->options}
        WHERE option_name
        LIKE '%s'",
        WC_POS_Admin_Settings::DB_PREFIX . '%'
      )
    );
  }

  /**
   * @param $id
   * @return WC_POS_Admin_Settings_Gateways|WP_Error
   */
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

    // special case: receipt_
    $receipts_section = preg_replace( '/^receipt_/', '', strtolower( $id ), 1, $count );
    if($count) {
      $class = 'WC_POS_Admin_Settings_Receipt_' . ucfirst( $receipts_section );
      return new $class();
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