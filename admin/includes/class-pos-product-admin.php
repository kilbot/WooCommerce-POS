<?php

/**
 * WP Products Admin Class
 *
 * Handles any changes to the WC Product Admin screens
 * 
 * @class 	  WooCommerce_POS_Products_Admin
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( ! class_exists( 'WooCommerce_POS_Products_Admin' ) ) :

class WooCommerce_POS_Products_Admin {

	/**
	 * Constructor
	 */
	public function __construct() {

		// Edit post screens
		add_filter( 'woocommerce_product_visibility_options', array( $this, 'visible_in_pos_only' ) );

		// Bump modified times
		add_action( 'save_post_product', array( $this, 'product_updated' ), 10, 1 );
	}

	/**
	 * Add POS Only to visiblity options 
	 * @param  array $options visibility options
	 * @return array
	 */
	public function visible_in_pos_only( $options ) {
		$options['pos_only'] = __( 'POS Only', 'woocommerce-pos' );
		return $options;
	}

	/**
	 * Bump variation modified time if parent is modified
	 * @param  $post_ID the variable product id
	 */
	public function product_updated( $post_ID ) {
		$product = get_product( $post_ID );
		if( $product->is_type( 'variable' ) && $product->has_child() ) {

			$post_modified     = current_time( 'mysql' );
			$post_modified_gmt = current_time( 'mysql', 1 );

			foreach ( $product->get_children() as $child_id ) {
				wp_update_post( array(
					'ID' 				=> $child_id,
					'post_modified' 	=> $post_modified,
					'post_modified_gmt' => $post_modified_gmt
				));
			}
		}
	}

}

endif;

new WooCommerce_POS_Products_Admin();