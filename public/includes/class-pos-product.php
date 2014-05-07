<?php

/**
 * Product Class
 *
 * Handles the products
 * 
 * @class 	  WooCommerce_POS_Product
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Product {

	
	public function __construct() {

		// we're going to manipulate the wp_query to display products
		add_action( 'pre_get_posts', array( $this, 'get_all_products' ) );

		// and we're going to filter on the way out
		add_filter( 'woocommerce_api_product_response', array( $this, 'filter_product_response' ) );

	}

	/**
	 * Get all the things
	 * @param  $query 		the wordpress query
	 */
	public function get_all_products( $query ) {

		// effects only requests from POS
		if( !WC_POS()->is_pos_referer() )
			return;

		// show all products
		// $query->set( 'posts_per_page', -1 ); 

		// plus variations
		$query->set( 'post_type', array( 'product', 'product_variation' ) );

		// minus variable products
		$tax_query =  array(
			array(
				'taxonomy' 	=> 'product_type',
				'field' 	=> 'slug',
				'terms' 	=> array( 'variable' ),
				'operator'	=> 'NOT IN'
			),
		);
		$query->set( 'tax_query', $tax_query );

        // error_log( print_R( $query, TRUE ) ); //debug
        
	}

	/**
	 * Filter product response from WC REST API for easier handling by backbone.js
	 * - unset unnecessary data
	 * - flatten some nest arrays
	 * @param  array $product_data
	 * @return array $product_data
	 */
	public function filter_product_response( $product_data ) {

		// effects only requests from POS
		if( !WC_POS()->is_pos_referer() )
			return;		

		// flatten variable data
		if( $product_data['type'] == 'variation' ) {

			// set new key parent id
			$product_data['parent_id'] = $product_data['parent']['id'];

			// if featured image = false, use the parent
			if( !$product_data['featured_src'] ) {
				if ( $product_data['parent']['featured_src'] ) 
					$product_data['featured_src'] = $product_data['parent']['featured_src'];
			}

			// turn variations into a html string
			$product_data['variation_html'] = '<dl>';
			foreach ( $product_data['attributes'] as $variation ) {
				$product_data['variation_html'] .= '<dt>'.$variation['name'] .':</dt>';
				$product_data['variation_html'] .= '<dd>'.$variation['option'] .'</dd>';
			}
			$product_data['variation_html'] .= '</dl>';

		}

		// use thumbnails for images or placeholder
		if( $product_data['featured_src'] ) {
			$thumb_size = get_option( 'shop_thumbnail_image_size', array( 'width'=>90, 'height'=> 90 ) );
			$thumb_suffix = '-'.$thumb_size['width'].'x'.$thumb_size['height'];
			$product_data['featured_src'] = preg_replace('/(\.gif|\.jpg|\.png)/', $thumb_suffix.'$1', $product_data['featured_src']);

		} else {
			$product_data['featured_src'] = WC_POS()->plugin_url . '/assets/placeholder.png';
		}

		//
		$removeKeys = array(
						'dimensions', 
						'shipping_required',
						'shipping_taxable',
						'shipping_class',
						'shipping_class_id',
						'description',
						'short_description',
						'reviews_allowed',
						'average_rating',
						'rating_count',
						'related_ids',
						'upsell_ids',
						'cross_sell_ids',
						'tags',
						'images',
						'downloads',
						'download_limit',
						'download_expiry',
						'download_type',
						'weight',
					);

		foreach($removeKeys as $key) {
			unset($product_data[$key]);
		}

		return $product_data;
	}

}