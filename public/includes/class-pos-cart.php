<?php

/**
 * Cart Class
 *
 * Handles the cart
 * 
 * @class 	  WooCommerce_POS_Cart
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Cart {

	public function __construct() {

		if (!defined( 'WOOCOMMERCE_CART')) define( 'WOOCOMMERCE_CART', true );

		
	}

}