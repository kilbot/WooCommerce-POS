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
	 * Instance of this class.
	 *
	 * @var      object
	 */
	protected static $instance = null;

	/**
	 * Constructor
	 */
	// public function __construct() {
	// 	// place hooks into init function so they can be unhooked later if necessary
	// }

	/**
	 * Return an instance of this class.
	 */
	public static function get_instance() {

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * [init description]
	 * @return [type] [description]
	 */
	public static function init() {
    	// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( WooCommerce_POS_Admin_Hooks::get_instance(), 'woocommerce_payment_gateways_setting_columns' ) );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( WooCommerce_POS_Admin_Hooks::get_instance(), 'pos_status' ) );
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
			if( $key == 'status' ) 
				$new_columns['pos_status'] = _x( 'POS', 'Payment gateway status', 'woocommerce-pos' );
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function pos_status( $gateway ) {
		echo '<td class="pos_status">';
		echo $gateway->enabled;
		// if ( $gateway->enabled == 'yes' )
		if ( true )
		echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce-pos' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
		else
		echo '-';
		echo '</td>';
	}

}

endif;

WooCommerce_POS_Admin_Hooks::init();