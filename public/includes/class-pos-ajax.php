<?php

/**
 * AJAX Event Handler
 *
 * Handles the ajax
 * Borrows heavily from WooCommerce
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

		// woocommerce_EVENT => nopriv
		$ajax_events = array(
			'add_to_cart'             				=> true,
			'remove_item'             				=> true,
			'get_products'             				=> true,
			'get_refreshed_fragments'             	=> true,
			'process_order'             			=> true,
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

		$product_id 	= $_REQUEST['id'];
		$quantity 		= 1;
		$variation_id 	= isset($_REQUEST['variation_id']) ? $_REQUEST['variation_id'] : '' ;
		$variation 		= '';

		$added_to_cart = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation);
		if( !$added_to_cart ) {
			$this->json_headers();
			echo json_encode( array ( 'error' => true, 'msg' => 'There was a problem adding the item to the cart' ) );
			die();
		} else {
			$this->get_refreshed_fragments();
		}
	}

	/**
	 * Remove item from cart
	 * @return Object JSON
	 */
	public function remove_item() {
		global $woocommerce;

		$href = $_POST['href'];
		parse_url( $href, PHP_URL_QUERY );
		parse_str( parse_url($href, PHP_URL_QUERY ), $query_arr);

		if( !isset( $query_arr['remove_item'] ) && isset( $query_arr['_wpnonce'] ) && wp_verify_nonce( $query_arr['_wpnonce'], 'woocommerce-cart' ) ) {
			$this->json_headers();
			echo json_encode( array( 'error' => true, 'msg' => 'There was no product to remove from cart' ) );
			die();	
		}

		WC()->cart->set_quantity( $query_arr['remove_item'], 0 );
		// wc_add_notice( __( 'Cart updated.', 'woocommerce' ) );
		$this->get_refreshed_fragments();
	}

	/**
	 * Get products
	 * @return Object JSON
	 */
	public function get_products() {

		// set up the product data
		$products = WC_POS()->product->get_all_products();
		$total = count($products);

		if($products) {
			$data = array(
				'status' 		=> 'success',
				'total_count'	=> $total,
				'products'		=> $products
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
		if( !wp_verify_nonce( $cart['woocommerce-pos_checkout'], 'checkout') ) 
			exit();

		// woocommerce wants to see the nonce
		$_POST['_wpnonce'] = $cart['woocommerce-pos_checkout'];

		// process order 
		$order_id = WC_POS()->checkout->create_order();
		$order = new WC_Order( $order_id );

		// get the order id

		// return the receipt screen
		ob_start();

		include_once( dirname(__FILE__) . '/../views/checkout.php' );

		$receipt = ob_get_clean();

		// Fragments and mini cart are returned
		$data = array(
			'fragments' => $receipt,
			'cart_hash' => $order_id
		);

		$this->json_headers();
		echo json_encode( $data );

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