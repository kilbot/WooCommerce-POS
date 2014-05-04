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

	}

	public function get_all_products( $query ) {

		// hijack any products query coming from POS
		if( $this->pos_referer() )  {

			// show all products
			$query->set( 'posts_per_page', -1 ); 

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
        
        // error_log( print_R( $query, TRUE ) ); //debug
        
	}

	public function pos_referer() {
		$referer = wp_get_referer();
		$parsed_referrer = parse_url( $referer );
		return ( $parsed_referrer['path'] == '/pos/' ) ? true : false ;
	}

}