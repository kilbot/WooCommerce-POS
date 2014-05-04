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

		// and limit searches to the titles
		add_filter( 'posts_search', array( $this, 'search_by_title_only' ), 500, 2 );

	}

	/**
	 * Get all the things
	 * @param  [type] $query [description]
	 * @return [type]        [description]
	 */
	public function get_all_products( $query ) {

		// hijack any products query coming from POS
		if( $this->pos_referer() )  {

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

		}
        
        error_log( print_R( $query, TRUE ) ); //debug
        
	}

	/**
	 * Check if request came from POS
	 * @return [type] [description]
	 */
	public function pos_referer() {
		$referer = wp_get_referer();
		$parsed_referrer = parse_url( $referer );
		return ( $parsed_referrer['path'] == '/pos/' ) ? true : false ;
	}

	/**
	 * Search only product titles
	 * @param  [type] $search   [description]
	 * @param  [type] $wp_query [description]
	 * @return [type]           [description]
	 */
	public function search_by_title_only( $search, &$wp_query ) {
		global $wpdb;

		if ( empty( $search ) || !$this->pos_referer() )
			return $search;

		$q = $wp_query->query_vars;
		$n = ! empty( $q['exact'] ) ? '' : '%';
		$search = '';
		$searchand = '';

		foreach ( (array) $q['search_terms'] as $term ) {
			$term = esc_sql( like_escape( $term ) );
			$search .= "{$searchand}($wpdb->posts.post_title LIKE '{$n}{$term}{$n}')";
			$searchand = ' AND ';
		}

		if ( ! empty( $search ) ) {
			$search = " AND ({$search}) ";

		if ( ! is_user_logged_in() )
			$search .= " AND ($wpdb->posts.post_password = '') ";
		}

		return $search;
	}

}