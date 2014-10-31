<?php

/**
 * Responsible for the POS front-end
 *
 * @class    WC_POS_Template
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Template {

	/**
	 * Constructor
	 */
	public function __construct() {

		add_filter( 'generate_rewrite_rules', array( $this, 'generate_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'template_redirect' ) );

	}

	public function generate_rewrite_rules( $wp_rewrite ) {
		$permalink = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'permalink' );
		$slug = $permalink && $permalink != '' ? $permalink : 'pos' ;

		$custom_page_rules = array(
			'^'. $slug .'/?$' => 'index.php?pos=1',
		);
		$wp_rewrite->rules = $custom_page_rules + $wp_rewrite->rules;
	}

	public function add_query_vars( $public_query_vars ) {
		$public_query_vars[] = 'pos';
		return $public_query_vars;
	}

	public function template_redirect() {

		// check is pos
		if( ! is_pos() )
			return;

		// check auth
		if( ! is_user_logged_in() )
			auth_redirect();

		// check privileges
		if( ! current_user_can( 'manage_woocommerce_pos' ) )
			wp_die( __( 'You do not have sufficient permissions to access this page.', 'woocommerce-pos' ) );

		// now show the page
		include 'views/pos.php';
		exit;

	}

}