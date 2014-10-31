<?php

/**
 * Global helper functions for WooCommerce POS
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 *
 */

/**
 * Construct the POS permalink
 * @param string $page
 * @return string|void
 */
function wc_pos_url( $page = '' ) {
	$slug = 'pos';
	$option = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'permalink' );
	if( $option && $option != '' )
		$slug = $option;

	return home_url( $slug . '/' .$page, 'relative' );
}


/**
 * @return bool
 */
function is_pos() {

	// for template requests
	global $wp;
	if( isset( $wp->query_vars['pos'] ) && $wp->query_vars['pos'] == 1 )
		return true;

	// for GET, POST requests
	if( isset( $_REQUEST['pos'] ) && $_REQUEST['pos'] == 1 )
		return true;

	// for PUT, DELETE requests
	$json_data = json_decode(trim(file_get_contents('php://input')), true);
	if( isset( $json_data['pos'] ) && $json_data['pos'] == 1 )
		return true;

	return false;
}