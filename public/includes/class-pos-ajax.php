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
			'process_order'             => false,
			'get_product_ids'			=> false,
			'get_modal'					=> false,
			'json_search_customers'		=> false,
			'set_product_visibilty' 	=> false,
			'email_receipt' 			=> false,
      'email_receipt_now' => false,
			'get_print_template' 		=> false,
      'add_customer' => false
		);

		foreach ( $ajax_events as $ajax_event => $nopriv ) {
			add_action( 'wp_ajax_pos_' . $ajax_event, array( $this, $ajax_event ) );

			if ( $nopriv )
				add_action( 'wp_ajax_nopriv_pos_' . $ajax_event, array( $this, $ajax_event ) );
		}
	}

  /**
  * Adds new customer
  * @return json
  */
  public function add_customer() {

    // security
    check_ajax_referer( 'woocommerce-pos', 'security' );
    $data = $_POST['data'];

    // make sure we have name and email address
    if( empty( $data['name'] ) || empty( $data['email'] )) {
      $this->json_headers();
      echo json_encode(array('error' => 'Please enter a valid name and email.'));
      die();
    }

    // get fields from the request
    $username = $data['name'];
    $email = $data['email'];

    // validate email address
    if(!is_email($email)) {
      $this->json_headers();
      echo json_encode(array('error' => "$email is not a valid email address. Please enter a valid email address."));
      die();
    }

    // check if user exists
    if( username_exists($username) != null ) {
      $this->json_headers();
      echo json_encode(array('error' => 'That name is already taken.'));
      die();
    }

    // create new user
    $password = wp_generate_password(12, true);
    $user_id = wp_create_user(
      $username,
      $password,
      $email
    );
    $user = new WP_User( $user_id );

    // set user role
    $user->set_role('customer');

    // email password
    wp_mail( $email, 'Welcome to POS!', 'Your password is: ' . $password );


    $this->json_headers();
    echo json_encode( $user );

    die();
  }

	/**
	 * Process the order
	 * TODO: validation
	 * @return json
	 */
	public function process_order() {

		// security
		check_ajax_referer( 'woocommerce-pos', 'security' );

		// if there is no cart, there is nothing to process!
		if( empty( $_REQUEST['line_items'] ) )
			wp_die('There are no cart items');

		// create order
		WC_POS()->is_pos = true;
		$response = WC_POS()->checkout->create_order();

		$this->json_headers();
		echo json_encode( $response );

		die();
	}

	public function email_receipt() {

		// security
		check_ajax_referer( 'woocommerce-pos', 'security' );

		// update order with email
		$response = WC_POS()->checkout->email_receipt();

		$this->json_headers();
		echo json_encode( $response );
		die();
	}

	public function email_receipt_now() {

		// security
		check_ajax_referer( 'woocommerce-pos', 'security' );

		// update order with email
		$response = WC_POS()->checkout->email_receipt_now();

		$this->json_headers();
		echo json_encode( $response );
		die();
	}

	/**
	 * Get all the product ids
	 * @return json
	 */
	public function get_product_ids() {

		// security
		check_ajax_referer( 'woocommerce-pos', 'security' );

		// get an array of product ids
		$ids = WC_POS()->product->get_all_ids();

		$this->json_headers();
		echo json_encode( $ids );
		die();
	}

	public function get_modal() {

		// security
		check_ajax_referer( 'woocommerce-pos', 'security' );

		if( isset( $_REQUEST['data']) )
			extract( $_REQUEST['data'] );

		include_once( dirname(__FILE__) . '/../views/modal/' . $_REQUEST['template'] . '.php' );
		die();
	}

	public function get_print_template() {

		// security
		check_ajax_referer( 'woocommerce-pos', 'security' );

		// check for custom template
		$template_path_theme = '/woocommerce-pos/';
		$template_path_plugin = WC_POS()->plugin_path. 'public/views/print/';

		wc_get_template( $_REQUEST['template'] . '.php', null, $template_path_theme, $template_path_plugin );

		die();
	}

	/**
	 * Search for customers and return json
	 * based on same method in woocommerce/includes/class-wc-ajax.php
	 * with a few changes to display more info
	 */
	public function json_search_customers() {

		// security
		check_ajax_referer( 'json-search-customers', 'security' );

		$term = wc_clean( stripslashes( $_GET['term'] ) );

		if ( empty( $term ) ) {
			die();
		}

		// get the default customer
		$customer_id 	= get_option( 'woocommerce_pos_default_customer', 0 );
		$default 		= get_userdata( $customer_id );
		if( ! $default ) {
			$default = new WP_User(0);

			// $default->first_name = __( 'Guest', 'woocommerce-pos' );
			//
			// using init() because __set throws a warning if WP_DEBUG true
			$data = array(
				'ID' 			=> 0,
				'first_name' 	=> __( 'Guest', 'woocommerce-pos' )
			);
			$default->init( (object)$data );
		}

		add_action( 'pre_user_query', array( __CLASS__, 'json_search_customer_name' ) );

		// query the users table
		$customers_query = new WP_User_Query( apply_filters( 'woocommerce_pos_json_search_customers_query', array(
			'fields'         => 'all',
			'orderby'        => 'display_name',
			'search'         => '*' . $term . '*',
			'search_columns' => array( 'ID', 'user_login', 'user_email', 'user_nicename' ),
		) ) );

		remove_action( 'pre_user_query', array( __CLASS__, 'json_search_customer_name' ) );

		// merge the two results
		$customers = $customers_query->get_results();

		// add the default customer to the results
		array_unshift( $customers, $default );

		foreach ( $customers as $customer ) {

			// use id as key to return unique array
			$found_customers[$customer->ID] = array(
				'id' 			=> $customer->ID,
				'display_name' 	=> $customer->display_name,
				'first_name' 	=> $customer->first_name,
				'last_name' 	=> $customer->last_name,
				'user_email' 	=> sanitize_email( $customer->user_email ),
			);
		}

		$this->json_headers();
		echo json_encode( $found_customers );
		die();
	}

	public static function json_search_customer_name( $query ) {
		global $wpdb;

		$term = wc_clean( stripslashes( $_GET['term'] ) );
		if ( method_exists( $wpdb, 'esc_like' ) ) {
			$term = $wpdb->esc_like( $term );
		} else {
			$term = like_escape( $term );
		}

		$query->query_from  .= " INNER JOIN {$wpdb->usermeta} AS user_name ON {$wpdb->users}.ID = user_name.user_id AND ( user_name.meta_key = 'first_name' OR user_name.meta_key = 'last_name' ) ";
		$query->query_where .= $wpdb->prepare( " OR user_name.meta_value LIKE %s ", '%' . $term . '%' );
	}

	/**
	 * Update POS visibilty option
	 */
	public function set_product_visibilty() {

		if( !isset( $_REQUEST['post_id'] ) )
			wp_die('Product ID required');

		// security
		check_ajax_referer( 'set-product-visibilty-'.$_REQUEST['post_id'], 'security' );

		// set the post_meta field
		if( update_post_meta( $_REQUEST['post_id'], '_pos_visibility', $_REQUEST['_pos_visibility'] ) ) {
			$post_modified     = current_time( 'mysql' );
			$post_modified_gmt = current_time( 'mysql', 1 );
			wp_update_post( array(
				'ID' 				=> $_REQUEST['post_id'],
				'post_modified' 	=> $post_modified,
				'post_modified_gmt' => $post_modified_gmt
			));
			$response = array('success' => true);
		}
		else {
			wp_die('Failed to update post meta table');
		}

		$this->json_headers();
		echo json_encode( $response );
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
