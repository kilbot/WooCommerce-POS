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
		$file_headers = @get_headers( WC_POS()->wc_api_url );
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
		$file_headers = @get_headers( WC_POS()->wc_api_url. 'products?pos=1' );
		if( strpos( $file_headers[0], '404 Not Found' ) === false ) {
			$api_auth = true;
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

		error_log( print_R( $posts, TRUE ) ); //debug

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