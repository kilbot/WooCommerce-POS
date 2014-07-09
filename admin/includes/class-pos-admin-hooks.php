<?php

/**
 * WP Products Admin Hooks Class
 *
 * A place to put all WP and WC admin hooks
 * 
 * @class 	  WooCommerce_POS_Admin_Hooks
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( ! class_exists( 'WooCommerce_POS_Admin_Hooks' ) ) :

class WooCommerce_POS_Admin_Hooks {

	/**
	 * Constructor
	 */
	public function __construct() {
		
		// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ) );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( $this, 'pos_status' ) );
	}

	/**
	 * Add POS Status column
	 * @param  array $columns
	 * @return array $new_columns
	 */
	public function woocommerce_payment_gateways_setting_columns( $columns ) {
		$new_columns = array();
		foreach ( $columns as $key => $column ) {
			$new_columns[$key] = $column;
			if( $key == 'status' ) {
				$new_columns['status'] = _x( 'Online Store', 'Payment gateway status', 'woocommerce-pos' );
				$new_columns['pos_status'] = _x( 'POS', 'Payment gateway status', 'woocommerce-pos' );
			}
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function pos_status( $gateway ) {

		$enabled_gateways = (array) get_option( 'woocommerce_pos_enabled_gateways' );

		echo '<td class="pos_status">';
		if ( in_array( $gateway->id, $enabled_gateways ) ) 
		echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce-pos' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
		else
		echo '-';
		echo '</td>';
	}

}

endif;

new WooCommerce_POS_Admin_Hooks();