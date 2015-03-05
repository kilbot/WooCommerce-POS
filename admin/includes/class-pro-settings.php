<?php

/**
 * WP Admin Class
 * 
 * @class 	  WooCommerce_POS_Admin
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Pro_Settings {

	public function __construct() {

		// add settings pages
		add_filter( 'woocommerce_pos_get_settings_pages', array( $this, 'add_settings_pages' ) );

		// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 30, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pro_enabled', array( $this, 'enabled_gateways' ), 30, 1 );
		add_action( 'woocommerce_pos_settings_save_checkout', array( $this, 'save_gateways' ), 1 );
	}

	/**
	 * [add_settings_pages description]
	 * @param [type] $settings [description]
	 */
	public function add_settings_pages( $settings ) {

		// add new settings page to the array
		$settings[] = include( 'settings/class-settings-license.php' );
		return $settings;
	}

	/**
	 * Add POS Status column
	 * @param  array $columns
	 * @return array $new_columns
	 */
	public function woocommerce_payment_gateways_setting_columns( $columns ) {
		unset( $columns['pos_enabled'] );
		unset( $columns['pro_status'] );
		$new_columns = array();
		foreach ( $columns as $key => $column ) {
			$new_columns[$key] = $column;
			if( $key == 'status' ) {
				$new_columns['pro_enabled'] = __( 'POS', 'woocommerce-pos-pro' );
			}
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function enabled_gateways( $gateway ) {

		$enabled_gateways = (array) get_option( 'woocommerce_pos_pro_enabled_gateways', get_option( 'woocommerce_pos_enabled_gateways' ) );
		$checked = '';

		echo '<td class="pro_enabled">';
		if ( in_array( $gateway->id, $enabled_gateways ) ) 
			$checked = 'checked';

		echo '<input type="checkbox" name="pro_enabled_gateways[]" value="' . esc_attr( $gateway->id ) . '"' . $checked .' >';
		echo '</td>';
	}

	public function save_gateways() {
		global $current_section;

		if ( ! $current_section ) {
			// update pro settings
			
			$enabled_gateways = ( isset( $_POST['pro_enabled_gateways'] ) ) ? $_POST['pro_enabled_gateways'] : '';
			update_option( 'woocommerce_pos_pro_enabled_gateways', $enabled_gateways );

			// leave pos settings unchanged
			$_POST['enabled_gateways'] = get_option( 'woocommerce_pos_enabled_gateways', '' );
		}
	}

}
new WooCommerce_POS_Pro_Settings();