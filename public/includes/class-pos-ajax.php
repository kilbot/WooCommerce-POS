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

		// woocommerce_EVENT => nopriv
		$ajax_events = array(
			'process_order'             => true,
			'get_product_ids'			=> true,
			'get_modal'					=> true,
		);

		foreach ( $ajax_events as $ajax_event => $nopriv ) {
			add_action( 'wp_ajax_pos_' . $ajax_event, array( $this, $ajax_event ) );

			if ( $nopriv )
				add_action( 'wp_ajax_nopriv_pos_' . $ajax_event, array( $this, $ajax_event ) );
		}
	}


	/**
	 * Process the order
	 * TODO: validation
	 * @return 
	 */
	public function process_order() {

		// create order 
		$checkout = new WooCommerce_POS_Checkout();
		$order_id = $checkout->create_order();

		$this->json_headers();
		
		echo file_get_contents( WC_POS()->wc_api_url . 'orders/' . $order_id );
		
		die();
	}

	public function get_product_ids() {

		// get an array of product ids
		$ids = WC_POS()->product->get_all_ids();

		$this->json_headers();
		echo json_encode( $ids );

		die();
	}

	public function get_modal() {

		include_once( dirname(__FILE__) . '/../views/modal/' . $_REQUEST['template'] . '.php' );
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