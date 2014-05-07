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
	 * init
	 */
	public function __construct() {

		if ( ! defined( 'WOOCOMMERCE_CART' ) ) 
			define( 'WOOCOMMERCE_CART', true );

		add_filter( 'woocommerce_cart_needs_shipping', array($this, 'remove_shipping') );
	
	}

	/**
	 * Remove any shipping from the POS cart
	 * @return boolean
	 */
	public function remove_shipping() {	
		
		if( WC_POS()->is_pos() || WC_POS()->is_pos_referer() ) 
			return false;

	}

	/**
	 * Update the cart
	 */
	public function update_cart() {

		// if there is json data through the http body
		$request_body = file_get_contents('php://input');

		if($request_body) {
			$data = json_decode($request_body);
			error_log( print_R( $data, TRUE ) ); //debug
			WC()->cart->set_quantity( $data->cart_item_key, $data->qty );
		}

		elseif (isset($_REQUEST['cart_item_key'])) {
			WC()->cart->set_quantity( $_REQUEST['cart_item_key'], $_REQUEST['qty'] );
		}
	}

	/**
	 * Get the current cart
	 */
	public function get_cart_items() {
		$items = array();

		$cart_items = WC()->cart->get_cart();

		// error_log( print_R( $cart_items, TRUE ) ); //debug
		
		if ( sizeof( WC()->cart->get_cart() ) > 0 ) :

			foreach($cart_items as $cart_item_key => $cart_item) {
				$_product     = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
				$product_id   = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );

				if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 ) {

					$product_name  = apply_filters( 'woocommerce_cart_item_name', $_product->get_title(), $cart_item, $cart_item_key );
					$product_price = apply_filters( 'woocommerce_cart_item_price', WC()->cart->get_product_price( $_product ), $cart_item, $cart_item_key );
					$product_total = apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key );

					$cart_item = array(
						'cart_item_key' => $cart_item_key,
						'title'			=> $product_name,
						'price_html'	=> $product_price,
						'qty'			=> $cart_item['quantity'],
						'total'			=> $product_total,

					);
					array_push($items, $cart_item);
				}
			}

		endif;

		return $items;
	}

	/**
	 * Get the current cart total
	 */
	public function get_cart_totals() {
		$totals = array(
			array(
				'title' => 'Sub Total',
				'total' => WC()->cart->get_cart_subtotal()
				),
			array(
				'title' => esc_html( WC()->countries->tax_or_vat() ),
				'total' => WC()->cart->get_cart_tax()
				),
			array(
				'title' => 'Discount',
				'total' => WC()->cart->get_total_discount()
			),
			array(
				'title' => 'Order Total',
				'total' => WC()->cart->get_total()
			),
				//'wp_nonce_field'=> wp_nonce_field('checkout','woocommerce-pos_checkout'),
		);

		return $totals;

	}

}