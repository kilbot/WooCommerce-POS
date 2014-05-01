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

	/**
	 * Initialize the cart
	 */
	public function init() {
		if (!defined( 'WOOCOMMERCE_CART')) define( 'WOOCOMMERCE_CART', true );
		$this->set_local_pickup();
	}

	/**
	 * Force the shipping method to be local pickup, ie: instore purchase
	 */
	public function set_local_pickup() {
		$chosen_shipping_methods[0] = 'local_pickup';
		WC()->session->set( 'chosen_shipping_methods', $chosen_shipping_methods );
		WC()->cart->calculate_totals();
	}

}