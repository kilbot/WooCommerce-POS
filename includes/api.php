<?php

/**
 * WC REST API Class
 *
 * @package  WCPOS\API
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class API {

	/**
	 *
	 */
	public function __construct() {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter( 'rest_pre_serve_request', array( $this, 'rest_pre_serve_request' ) );
		$this->init();
	}


	private function init() {
		new \WCPOS\API\Products();
	}


	/**
	 * @param $value
	 * @return mixed $value
	 */
	public function rest_pre_serve_request( $value ) {
		$cors_headers = array(
//			'Access-Control-Allow-Headers',
//			'Access-Control-Request-Headers',
//			'Access-Control-Request-Method',
			'Authorization',
			'Credentials',
//			'Origin',
			'X-WCPOS',
		);
		header( 'Access-Control-Allow-Origin: http://localhost:3000' );
		header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE' );
		header( 'Access-Control-Allow-Credentials: true' );
		header( 'Access-Control-Allow-Headers: ' . implode( ', ', $cors_headers ) );

		return $value;
	}


	/**
	 *
	 */
//	private function init()
//	{
//		$controllers = array(
//			'\WCPOS\API\Legacy\v1\Users',
//		);
//
//		foreach ($controllers as $controller) {
//			$controller = new $controller();
//			$controller->register_routes();
//		}
//	}

}
