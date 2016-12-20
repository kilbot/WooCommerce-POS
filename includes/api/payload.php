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

use WC_API_Resource;
use WC_API_Server;

class Payload extends WC_API_Resource {

  protected $base = '/pos';

  /**
   * Register routes for POS Params
   *
   * GET /pos
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( array $routes ) {

    # GET /pos
    $routes[ $this->base ] = array(
      array( array( $this, 'get_payload' ), WC_API_Server::READABLE )
    );

    return $routes;

  }


  /**
   * @param null $wc_pos_admin
   * @return array
   */
  public function get_payload( $wc_pos_admin = null ) {
    $wc_api = WC()->api;

    $payload = array(
      'i18n'      => $wc_api->{'\WC_POS\API\i18n'}->get_translations( $wc_pos_admin ),
      'params'    => $wc_api->{'\WC_POS\API\Params'}->get_params( $wc_pos_admin ),
      'templates' => $wc_api->{'\WC_POS\API\Templates'}->get_templates( $wc_pos_admin ),
    );

    if( $wc_pos_admin ){
      $payload['params']['settings'] = $wc_api->{'\WC_POS\API\Settings'}->get_settings( '', $wc_pos_admin );
    } else {
      $payload['params']['gateways'] = $wc_api->{'\WC_POS\API\Gateways'}->get_gateways();
    }

    return $payload;
  }

}