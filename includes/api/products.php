<?php

/**
 * WC REST API Class
 *
 * @package  WCPOS\API\Products
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\API;

class Products {

	/**
	 *
	 */
	public function __construct() {
		add_filter( 'woocommerce_rest_prepare_product_object', array( $this, 'product_response' ), 10, 3 );
		add_filter( 'woocommerce_rest_prepare_product_variation_object', array(
			$this,
			'product_variation_response'
		), 10, 3 );
	}


	/**
	 * Filter the product response
	 *
	 * @param \WP_REST_Response $response The response object.
	 * @param \WC_Data $product Product data.
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response $response The response object.
	 */
	public function product_response( \WP_REST_Response $response, \WC_Data $product, \WP_REST_Request $request ) {
		// get the old product data
		$data = $response->get_data();

		// set thumbnail
		$data['thumbnail'] = $this->get_thumbnail( $product->get_id() );

		// reset the new response data
		$response->set_data( $data );

		return $response;
	}


	/**
	 * Filter the product variation response
	 *
	 * @param \WP_REST_Response $response The response object.
	 * @param \WC_Data $product_variation Product data.
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response $response The response object.
	 */
	public function product_variation_response( \WP_REST_Response $response, \WC_Data $product_variation, \WP_REST_Request $request ) {
		// get the old product data
		$data = $response->get_data();

		// reset the new response data
		$response->set_data( $data );

		return $response;
	}


	/**
	 * Returns thumbnail if it exists, if not, returns the WC placeholder image
	 * @param int $id
	 * @return string
	 */
	private function get_thumbnail( $id ) {
		$image    = false;
		$thumb_id = get_post_thumbnail_id( $id );

		if ( $thumb_id ) {
			$image = wp_get_attachment_image_src( $thumb_id, 'shop_thumbnail' );
		}

		if ( is_array( $image ) ) {
			return $image[0];
		}

		return wc_placeholder_img_src();
	}

	/**
	 * Returns array of all product ids
	 *
	 * @param array $filter
	 * @return array|void
	 */
	public function get_all_ids( $filter = array() ) {
		$args = array(
			'post_type'      => array( 'product' ),
			'post_status'    => array( 'publish' ),
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'order'          => isset( $filter['order'] ) ? $filter['order'] : 'ASC',
			'orderby'        => isset( $filter['orderby'] ) ? $filter['orderby'] : 'title'
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
