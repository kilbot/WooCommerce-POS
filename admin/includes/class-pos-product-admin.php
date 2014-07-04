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

}

endif;

new WooCommerce_POS_Products_Admin();