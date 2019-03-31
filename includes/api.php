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
		add_filter( 'rest_index', array( $this, 'rest_index' ) );
		add_action( 'parse_request', array( $this, 'parse_request' ), -1, 1 );
		$this->init();
	}


	private function init() {
		new \WCPOS\API\Products();
	}


	/**
	 * @param $response_object
	 * @return mixed
	 */
	public function rest_index( $response_object ) {

		if ( empty( $response_object->data['authentication'] ) ) {
			$response_object->data['authentication'] = array();
		}
		$response_object->data['authentication']['wcpos'] = array(
			'authorize' => site_url( 'wc-auth/v1/authorize' ),
		);

		return $response_object;
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

	/**
	 *
	 */
	public function parse_request( \WP $wp ) {
		if ( ! empty( $wp->query_vars['wc-auth-version'] ) && ! empty( $wp->query_vars['wc-auth-route'] ) ) {
			if ( $wp->query_vars['wc-auth-route'] == 'access_granted' ) {
				add_filter( 'pre_http_request', array( $this, 'pre_http_request' ), 10, 3 );
			}
		}
	}

	/**
	 *
	 */
	public function pre_http_request( $pre, $request, $url ) {
		if ( $url == 'https://client.wcpos.com' ) {
			// @TODO - add user details
			echo '<script>window.postMessage(' . $request['body'] . ')</script>';
			exit;
		} else {
			return $pre;
		}
	}

}
