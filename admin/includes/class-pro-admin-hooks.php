<?php

/**
 * Admin Hooks Class
 *
 * A place to put all WP and WC admin hooks
 * 
 * @class 	  WooCommerce_POS_Pro_Admin_Hooks
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( ! class_exists( 'WooCommerce_POS_Pro_Admin_Hooks' ) ) :

class WooCommerce_POS_Pro_Admin_Hooks {

	/**
	 * Constructor
	 */
	public function __construct() {
		
		// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 30, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pro_status', array( $this, 'pro_gateway_status' ), 30, 1 );
	}

	/**
	 * Add POS Status column
	 * @param  array $columns
	 * @return array $new_columns
	 */
	public function woocommerce_payment_gateways_setting_columns( $columns ) {
		unset( $columns['pos_status'] );
		$new_columns = array();
		foreach ( $columns as $key => $column ) {
			$new_columns[$key] = $column;
			if( $key == 'status' ) {
				$new_columns['status'] = _x( 'Online Store', 'Payment gateway status', 'woocommerce-pos' );
				$new_columns['pro_status'] = _x( 'POS', 'Payment gateway status', 'woocommerce-pos' );
			}
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function pro_gateway_status( $gateway ) {

		$gateway_enabled = (array) get_option( 'woocommerce_pos_pro_enabled_gateways' );

		echo '<td class="pro_status">';
		if ( in_array( $gateway->id, $gateway_enabled ) ) 
		echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce-pos' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
		else
		echo '-';
		echo '</td>';
	}

}

endif;

new WooCommerce_POS_Pro_Admin_Hooks();