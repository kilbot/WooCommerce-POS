<?php

/**
 * WC REST API Class
 *
 * @package  WCPOS\API
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class Auth {

	private $endpoint = 'wc-auth/v1';

	/**
	 * Authentication for POS app using default WC Auth
	 * @TODO - move to OAuth 2.0 or JWT when part of WordPress Core
	 */
	public function __construct() {
		add_filter( 'rest_index', array( $this, 'rest_index' ) );
		add_filter( 'woocommerce_get_endpoint_url', array( $this, 'woocommerce_get_endpoint_url' ), 10, 4 );
		add_action( 'parse_request', array( $this, 'parse_request' ), -1, 1 );
	}

	/**
	 * Add wc-auth method to the api response
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
	 * Add flag for WCPOS
	 * @param  string $url Endpoint url.
	 * @param  string $endpoint Endpoint slug.
	 * @param  string $value Query param value.
	 * @param  string $permalink Permalink.
	 * @return string
	 */
	public function woocommerce_get_endpoint_url( $url, $endpoint, $value, $permalink ) {
		if ( is_pos() && $endpoint == $this->endpoint ) {
			return $url . '?wcpos=1';
		}

		return $url;
	}


	/**
	 * Hijack WC Auth
	 * @param \WP $wp
	 */
	public function parse_request( \WP $wp ) {
		if (
			empty( $wp->query_vars['wcpos'] ) ||
			empty( $wp->query_vars['wc-auth-version'] ) ||
			empty( $wp->query_vars['wc-auth-route'] ) ||
			$wp->query_vars['wcpos'] != 1 ) {
			return; // exit early
		}

		if ( $wp->query_vars['wc-auth-route'] == 'authorize' ) {
			add_action( 'woocommerce_auth_page_footer', array( $this, 'woocommerce_auth_page_footer' ) );
		}

		if ( $wp->query_vars['wc-auth-route'] == 'access_granted' ) {
			add_filter( 'pre_http_request', array( $this, 'pre_http_request' ), 10, 3 );
		}
	}


	/**
	 * Send user info to POS app
	 */
	public function woocommerce_auth_page_footer() {
		$current_user = wp_get_current_user();
		if ( ! $current_user->exists() ) {
			return; // early exit
		}

		$user = array(
			'id'           => $current_user->ID,
			'username'     => $current_user->user_login,
			'first_name'   => $current_user->user_firstname,
			'last_name'    => $current_user->user_lastname,
			'display_name' => $current_user->display_name,
			'email'        => $current_user->user_email
		);

		echo '<script>window.parent && window.parent.postMessage(' . json_encode( $user ) . ', "*")</script>';
	}

	/**
	 * Send auth info to POS app
	 */
	public function pre_http_request( $pre, $request, $url ) {
		if ( $url == 'https://client.wcpos.com' ) {
			echo
				'<html>
					<body>
						<script>window.parent && window.parent.postMessage(' . $request['body'] . ', "*")</script>
					</body>
				</html>';
			exit;
		} else {
			return $pre;
		}
	}

}
