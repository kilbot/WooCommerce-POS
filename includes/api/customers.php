<?php

/**
 * WC REST API Class
 *
 * @package  WCPOS\API\Customers
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\API;

class Customers {

	/**
	 *
	 */
	public function __construct() {

	}


	/**
	 * Returns array of all product ids
	 *
	 * @param array $filter
	 * @return array|void
	 */
	public function get_all_ids( $filter = array() ) {
		$args = array(
			'fields' => 'ID'
		);
		if ( isset( $filter['after'] ) ) {
			$args['meta_key']     = '_user_modified_gmt';
			$args['meta_value']   = $filter['after'];
			$args['meta_compare'] = '>';
		}
		$query = new WP_User_Query( $args );

		return array_map( array( $this, 'format_id' ), $query->results );
	}

	/**
	 * @param $id
	 * @return array
	 */
	private function format_id( $id ) {
		return array( 'id' => (int) $id );
	}
}
