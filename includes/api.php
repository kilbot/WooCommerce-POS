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

	private $handler;

	/**
	 *
	 */
	public function __construct() {
		add_filter( 'rest_dispatch_request', array( $this, 'rest_dispatch_request' ), 10, 4 );
	}

	private function init_handler( $route ) {
		switch ( $route ) {
			case '/wc/v3/products':
				$this->handler = new API\Products();
			case '/wc/v3/customers':
				$this->handler = new API\Customers();
			case '/wc/v3/orders':
				$this->handler = new API\Orders();
			default:
				return;
		}
	}

	/**
	 * @param mixed $dispatch_result Dispatch result, will be used if not empty.
	 * @param WP_REST_Request $request Request used to generate the response.
	 * @param string $route Route matched for the request.
	 * @param array $handler Route handler used for the request.
	 * @return mixed
	 */
	public function rest_dispatch_request( $dispatch_result, $request, $route, $handler ) {
		$params = $request->get_params();

		$this->init_handler( $route );

		if ( isset( $params['fields'] ) && in_array( 'id', $params['fields'] ) ) {
			if ( $this->handler ) {
				$dispatch_result = $this->handler->get_all_ids();
			}
		}

		return $dispatch_result;
	}

}
