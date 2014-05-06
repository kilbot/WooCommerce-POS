<?php

/**
 * AJAX Event Handler
 *
 * Handles the ajax
 * Borrows heavily from WooCommerce, hopefully can be replaced by WC API in time
 * 
 * @class 	  WooCommerce_POS_AJAX
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_AJAX {

	/**
	 * Hook into ajax events
	 */
	public function __construct() {

		if ( ! defined( 'WOOCOMMERCE_CART' ) ) define( 'WOOCOMMERCE_CART', true );
		if ( ! defined( 'WOOCOMMERCE_CHECKOUT' ) ) define( 'WOOCOMMERCE_CHECKOUT', true );

		// woocommerce_EVENT => nopriv
		$ajax_events = array(
			'add_to_cart'             	=> true,
			'remove_item'             	=> true,
			'get_cart_items'			=> true,
			'get_cart_totals'			=> true,
			'process_order'             => true,
		);

		foreach ( $ajax_events as $ajax_event => $nopriv ) {
			add_action( 'wp_ajax_pos_' . $ajax_event, array( $this, $ajax_event ) );

			if ( $nopriv )
				add_action( 'wp_ajax_nopriv_pos_' . $ajax_event, array( $this, $ajax_event ) );
		}
	}

		/**
	 * Add item to cart
	 * @return  Object JSON
	 */
	public function add_to_cart() {
		global $woocommerce;

		$product_id 	= $_REQUEST['add_to_cart'];
		$quantity 		= 1;
		$variation_id 	= isset($_REQUEST['variation_id']) ? $_REQUEST['variation_id'] : '' ;
		$variation 		= '';

		$added_to_cart = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation);
		if( !$added_to_cart ) {
			$this->json_headers();
			echo json_encode( array ( 'error' => true, 'msg' => 'There was a problem adding the item to the cart' ) );
			die();
		} else {
			$this->get_cart_items();
		}
	}

	/**
	 * Remove item from cart
	 * @return Object JSON
	 */
	public function remove_item() {

		// if( !isset( $query_arr['remove_item'] ) && isset( $query_arr['_wpnonce'] ) && wp_verify_nonce( $query_arr['_wpnonce'], 'woocommerce-cart' ) ) {
		// 	$this->json_headers();
		// 	echo json_encode( array( 'error' => true, 'msg' => 'There was no product to remove from cart' ) );
		// 	die();	
		// }

		// set product quantity to zero
		WC()->cart->set_quantity( $_REQUEST['remove_item'], 0 );

		// send back new cart
		$this->get_cart_items();
	}

	/**
	 * Get cart
	 * @return Object JSON
	 */
	public function get_cart_items() {

		// set up the product data
		$items = WC_POS()->cart->get_cart_items();

		if($items || empty($items)) {
			$data = array(
				'nonce' => wp_create_nonce('woocommerce-pos_checkout'),
				'items' => $items
			);
		}
		else {
			// throw error
			$data = array(
				'status' => 'error',
			);
		}

		$this->json_headers();
		echo json_encode( $data );
		die();
	}

	/**
	 * Get cart
	 * @return Object JSON
	 */
	public function get_cart_totals() {

		// set up the product data
		$totals = WC_POS()->cart->get_cart_totals();

		if($totals) {
			$data = array(
				'totals' => $totals
			);
		}
		else {
			// throw error
			$data = array(
				'status' => 'error',
			);
		}

		$this->json_headers();
		echo json_encode( $data );
		die();
	}

	/**
	 * Get a refreshed cart fragment
	 * @return  Object JSON
	 */
	public function get_refreshed_fragments() {
		global $woocommerce;

		// Get cart
		ob_start();

		include_once( dirname(__FILE__) . '/../views/cart.php' );

		$cart = ob_get_clean();

		// Fragments and mini cart are returned
		$data = array(
			'fragments' => $cart,
			'cart_hash' => WC()->cart->get_cart() ? md5( json_encode( WC()->cart->get_cart() ) ) : ''
		);

		$this->json_headers();
		echo json_encode( $data );

		die();
	}

	/**
	 * Process the order 
	 * @return 
	 */
	public function process_order() {
		global $woocommerce;

		// no action
		if( !empty( $_REQUEST['pos_checkout'] ) ) 
			exit();

		// no nonce
		parse_str($_REQUEST['cart'], $cart); // $cart is now an array of form data
		// if( !wp_verify_nonce( $cart['woocommerce-pos_checkout'], 'checkout') ) 
		// 	exit();

		// // woocommerce wants to see the nonce
		// $_POST['_wpnonce'] = $cart['woocommerce-pos_checkout'];

		// process order 
		$order_id = WC_POS()->checkout->create_order();
		$order = new WC_Order( $order_id );

		// get the order id

		// return the receipt screen
		ob_start();

		include_once( dirname(__FILE__) . '/../views/receipt.php' );

		$receipt = ob_get_clean();

		$this->json_headers();
		echo json_encode( $receipt );

		die();
	}

	/**
	 * Output headers for JSON requests
	 */
	private function json_headers() {
		header( 'Content-Type: application/json; charset=utf-8' );
	}

}

new WooCommerce_POS_AJAX();