<?php

/**
 * Tools to help debug POS
 * 
 * @class 	  WooCommerce_POS_Support
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Tools {

	/** @var string Contains orphan ids, if any */
	public $orphans;

	/** @var string Contains user */
	public $auth_response;

	public function __construct() {

	}

	/**
	 * Test WC >= 2.1
	 * @return boolean
	 */
	public function wc_version_check() {
		$result = version_compare( WC()->version, '2.1.0' ) >= 0 ? true : false;
		return $result;
	}

	/**
	 * Check API is active
	 * @return boolean
	 */
	public function check_api_active() {
		$api_access = false;
		$file_headers = @get_headers( home_url(WC_POS()->wc_api_url) );
		if( strpos( $file_headers[0], '404 Not Found' ) === false ) {
			$api_access = true;
		}
		return $api_access;
	}

	/**
	 * Check WC REST API authentication
	 * Note: this will not pass the cookie authentication
	 * @return boolean
	 */
	public function check_api_auth() {
		$api_auth = false;

		$user = apply_filters( 'woocommerce_api_check_authentication', null, $this );

		if( get_class( $user ) == 'WP_User' ) {
			$user_info = array(
				'user_login' => $user->user_login,
				'roles'		 => $user->roles,
				'read_private_products' => isset( $user->allcaps['read_private_products'] ) ? $user->allcaps['read_private_products'] : '' ,
				'manage_woocommerce_pos' => isset( $user->allcaps['manage_woocommerce_pos'] ) ? $user->allcaps['manage_woocommerce_pos'] : '' ,
			);
			if( $user_info['read_private_products'] && $user_info['manage_woocommerce_pos'] )
				$api_auth = true;

			$this->auth_response = print_r( $user_info, true );

		} else {

			$this->auth_response = 'WP_Error';
		}

		return $api_auth;
	}

	/**
	 * Find orphaned variations
	 * props @pmgarman: https://gist.github.com/pmgarman/6135967
	 * @return boolean
	 */
	public function check_orphan_variations() {
		global $wpdb;
		$orphans = false;

		$posts = $wpdb->get_results(
			"
			SELECT o.ID FROM $wpdb->posts o
			LEFT OUTER JOIN $wpdb->posts r
			ON o.post_parent = r.ID
			WHERE r.id IS null AND o.post_type = 'product_variation';
			"
		);

		// error_log( print_R( $posts, TRUE ) ); //debug

		foreach( $posts as $post ) {
			$orphans[] = $post->ID; 
		}

		if( !empty( $orphans ) ) {
			$this->orphans = implode( ', ', $orphans );
			$orphans = true;
		};

		return $orphans;
	}

	/**
	 * Delete orphaned variations
	 * props @pmgarman: https://gist.github.com/pmgarman/6135967
	 * @return int $rows number of rows deleted
	 */
	public function delete_orphan_variations() {
		global $wpdb;
		$rows = $wpdb->query( 
			"
			DELETE o FROM $wpdb->posts o
			LEFT OUTER JOIN $wpdb->posts r
			ON o.post_parent = r.ID
			WHERE r.id IS null AND o.post_type = 'product_variation'
			"
		);

		return $rows;
	}

}