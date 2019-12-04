<?php

/**
 * WC REST API Class
 *
 * @package  WCPOS\API\Orders
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\API;

class Orders {

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
			'post_type'      => array( 'shop_order' ),
			'post_status'    => array( 'any' ),
			'posts_per_page' => -1,
			'fields'         => 'ids',
//			'order'          => isset( $filter['order'] ) ? $filter['order'] : 'ASC',
//			'orderby'        => isset( $filter['orderby'] ) ? $filter['orderby'] : 'title'
		);

		if ( isset( $filter['after'] ) ) {
			$args['date_query'][] = array(
				'column'    => 'post_modified_gmt',
				'after'     => $filter['after'],
				'inclusive' => false
			);
		}

		$query = new \WP_Query( $args );

		return array_map( array( $this, 'format_id' ), $query->posts );
	}

	/**
	 * @param $id
	 * @return array
	 */
	private function format_id( $id ) {
		return array( 'id' => (int) $id );
	}
}
