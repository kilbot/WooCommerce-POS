<?php

/**
 * WC REST API Class
 *
 * @package    WCPOS\API
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class Load {
	/**
	 *
	 */
	public function __construct() {
		add_filter( 'woocommerce_api_classes', array( $this, 'api_classes' ) );
		add_filter( 'woocommerce_api_dispatch_args', array( $this, 'dispatch_args' ), 10, 2 );
		add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );
	}

	/**
	 *
	 */
	private function init() {
		$controllers = array( '\WCPOS\API\v1\Users' );

		foreach ( $controllers as $controller ) {
			$controller = new $controller();
			$controller->register_routes();
		}
	}

	/**
	 * Load API classes
	 *
	 * @param array $classes
	 * @return array
	 */
	public function api_classes( array $classes ) {
// common classes
		array_push(
			$classes,
			'\WCPOS\API\Coupons',
			'\WCPOS\API\Customers',
			'\WCPOS\API\i18n',
			'\WCPOS\API\Orders',
			'\WCPOS\API\Params',
			'\WCPOS\API\Payload',
			'\WCPOS\API\Products',
			'\WCPOS\API\Templates'
		);

// frontend only
		if ( current_user_can( 'access_woocommerce_pos' ) ) {
			array_push( $classes, '\WCPOS\API\Gateways', '\WCPOS\API\Support' );
		}

// admin only
		if ( current_user_can( 'manage_woocommerce_pos' ) ) {
			array_push( $classes, '\WCPOS\API\Settings' );
		}

		return $classes;
	}

	/**
	 * @todo this is a total hack, need to customise bb remote sync
	 *
	 * @param $args
	 * @param $callback
	 * @return mixed
	 */
	public function dispatch_args( $args, $callback ) {
// note: using headers rather than query params, easier to manage through the js app
		$args['wcpos_admin'] = is_pos_admin();

		return $args;
	}

	/**
	 * - this filter was introduced in WC 2.3
	 * @param $args
	 * @param $request_args
	 * @return mixed
	 */
	public function woocommerce_api_query_args( $args, $request_args ) {
// required for compatibility WC < 2.3.5
		if ( ! empty( $request_args['in'] ) ) {
			$args['post__in'] = explode( ',', $request_args['in'] );
			unset( $request_args['in'] );
		}

// required for compatibility WC < 2.4
		if ( ! empty( $request_args['not_in'] ) ) {
			$args['post__not_in'] = explode( ',', $request_args['not_in'] );
			unset( $request_args['not_in'] );
		}

// remove relevanssi
		remove_filter( 'posts_request', 'relevanssi_prevent_default_request' );
		remove_filter( 'the_posts', 'relevanssi_query' );

		return $args;
	}
}
