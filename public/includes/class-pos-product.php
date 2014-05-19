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
	 * Get all the product ids 
	 * @return array
	 */
	public function get_all_ids() {

		// set up the args
		$args = array(
			'posts_per_page' =>  -1,
			'post_type' => array( 'product', 'product_variation' ),
			'tax_query' => array(
				array(
					'taxonomy' 	=> 'product_type',
					'field' 	=> 'slug',
					'terms' 	=> array( 'variable' ),
					'operator'	=> 'NOT IN'
				)
			),
			'fields'        => 'ids', // only get post IDs.
		);

		return(get_posts( $args ));

	}

	/**
	 * Get all the things
	 * @param  $query 		the wordpress query
	 */
	public function get_all_products( $query ) {

		// effects only requests from POS
		// TODO: this needs to be less clumsy
		// it effects going from pos to admin & shop
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
	 * - flatten some nested arrays
	 * @param  array $product_data
	 * @return array modified data array $product_data
	 */
	public function filter_product_response( $product_data ) {

		// effects only requests from POS
		if( !WC_POS()->is_pos_referer() )
			return $product_data ;		

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
		
		// if taxable, calculate taxes and add them to the product array
		if( $product_data['taxable'] ) {
			$taxes = $this->calc_line_taxes( $product_data['price'] );
			$product_data['taxes'] = $taxes;
			// error_log( print_R( $taxes, TRUE ) ); //debug
		}

		// remove some unnecessary keys
		// - saves storage space in IndexedDB
		// - saves bandwidth transferring the data
		// eg: removing 'description' reduces object size by ~25%
		$removeKeys = array(
			'average_rating',
			'cross_sell_ids',
			'description',
			'dimensions', 
			'download_expiry',
			'download_limit',
			'download_type',
			'downloads',
			'images',
			'parent',
			'rating_count',
			'related_ids',
			'reviews_allowed',
			'shipping_class',
			'shipping_class_id',
			'shipping_required',
			'shipping_taxable',
			'short_description',
			'tags',
			'upsell_ids',
			'weight',
		);
		foreach($removeKeys as $key) {
			unset($product_data[$key]);
		}

		return $product_data;
	}


	/**
	 * Calc line tax
	 * based on the same function in woocommerce/includes/class-wc-ajax.php
	 */
	public function calc_line_taxes( $price ) {
		global $wpdb;

		$tax      = new WC_Tax();
		$taxes    = array();
		$itemized = array();

		// calculate tax rates at store base
		// this could be conditional on get_option for stores with more than one location
		$base = get_option( 'woocommerce_default_country' );
		if ( strstr( $base, ':' ) ) {
			list( $country, $state ) = explode( ':', $base );
		} else {
			$country = $base;
			$state = '';
		}
		$tax_rates = $tax->find_rates( array( 'country' => $country, 'state' => $state ) );

		// get user settings
		$price_includes_tax = get_option( 'woocommerce_prices_include_tax' ) == 'yes' ? true : false ;
		$suppress_rounding = get_option( 'woocommerce_tax_round_at_subtotal' ) == 'yes' ? true : false ;

		// calculate sales tax
		$tax_itemized 	= $tax->calc_tax( $price, $tax_rates, $price_includes_tax, $suppress_rounding );
		$tax_total 		= array_sum( $tax_itemized );

		// create an array of itemized tax info
		foreach ( array_keys( $tax_itemized ) as $key ) {

			$item                        = array();
			$item['rate_id']             = $key;
			$item['name']                = $tax->get_rate_code( $key );
			$item['label']               = $tax->get_rate_label( $key );
			$item['compound']            = $tax->is_compound( $key ) ? 1 : 0;
			$item['tax_amount']          = wc_format_decimal( isset( $tax_itemized[ $key ] ) ? $tax_itemized[ $key ] : 0 );

			if ( ! $item['label'] ) {
				$item['label'] = WC()->countries->tax_or_vat();
			}

			$itemized[$key] = $item;

		}

		// set up taxes array
		$taxes['itemized'] = $itemized;
		$taxes['total'] = $tax_total;

		return $taxes;
	}

}


