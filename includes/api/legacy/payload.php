<?php

/**
 * POS Payload
 *
 * @package    WCPOS\API_Payload
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\API;

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
	 * @param null $wcpos_admin
	 * @return array
	 */
	public function get_payload( $wcpos_admin = null ) {
		$wc_api = WC()->api;

		$payload = array(
			'i18n'      => $wc_api->{'\WCPOS\API\i18n'}->get_translations( $wcpos_admin ),
			'params'    => $wc_api->{'\WCPOS\API\Params'}->get_params( $wcpos_admin ),
			'templates' => $wc_api->{'\WCPOS\API\Templates'}->get_templates( $wcpos_admin ),
		);

		if ( $wcpos_admin ) {
			$payload['params']['settings'] = $wc_api->{'\WCPOS\API\Settings'}->get_settings( '', $wcpos_admin );
		} else {
			$payload['params']['gateways'] = $wc_api->{'\WCPOS\API\Gateways'}->get_gateways();
		}

		return $payload;
	}

}
