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
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 10, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( $this, 'pos_status' ), 10, 1 );

		// add filter links for pos only
		add_filter( 'views_edit-product', array( $this, 'pos_visibility_filters' ), 10, 1 );
		add_filter( 'views_edit-shop_order', array( $this, 'pos_order_filters' ), 10, 1 );
		add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ), 10, 1 );

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

	/**
	 * Admin filters for POS / Online visibility
	 * @param  array $views 
	 * @return array
	 */
	public function pos_visibility_filters( $views ) {
		global $wpdb;

		$visibility_filters = array(
			// 'pos_and_online' => __( 'POS & Online', 'woocommerce-pos' ),
			'pos_only' => __( 'POS Only', 'woocommerce-pos' ),
			'online_only' => __( 'Online Only', 'woocommerce-pos' )
		);

		if ( isset( $_GET['pos_visibility'] ) && !empty( $_GET['pos_visibility'] ) ) {
			$views['all'] = str_replace( 'class="current"', '', $views['all'] );
		}

		foreach( $visibility_filters as $key => $label ) {

			$sql = "SELECT count(DISTINCT pm.post_id)
			FROM $wpdb->postmeta pm
			JOIN $wpdb->posts p ON (p.ID = pm.post_id)
			WHERE pm.meta_key = '_pos_visibility'
			AND pm.meta_value = '$key'
			AND p.post_type = 'product'
			AND p.post_status = 'publish'
			";
			$count = $wpdb->get_var($sql);

			$class 			= ( isset( $_GET['pos_visibility'] ) && $_GET['pos_visibility'] == $key ) ? 'current' : '';
			if( $class == '' ) $query_string = remove_query_arg(array( 'paged' ));
			$query_string 	= remove_query_arg(array( 'pos_visibility' ));
			$query_string 	= add_query_arg( 'pos_visibility', urlencode($key), $query_string );
			$views[$key] 	= '<a href="'. $query_string . '" class="' . esc_attr( $class ) . '">' . $label . ' <span class="count">(' . $count . ')</a></a>';
		}

		return $views;
	}


	/**
	 * Admin filters for POS Orders
	 * @param  array $views 
	 * @return array
	 */
	public function pos_order_filters( $views ) {
		global $wpdb;

		$visibility_filters = array(
			// 'pos_and_online' => __( 'POS & Online', 'woocommerce-pos' ),
			'yes' => __( 'POS', 'woocommerce-pos' ),
			'no' => __( 'Online', 'woocommerce-pos' )
		);

		if ( isset( $_GET['pos_order'] ) && !empty( $_GET['pos_order'] ) ) {
			$views['all'] = str_replace( 'class="current"', '', $views['all'] );
		}

		foreach( $visibility_filters as $key => $label ) {

			$sql = "SELECT count(DISTINCT pm.post_id)
			FROM $wpdb->postmeta pm
			JOIN $wpdb->posts p ON (p.ID = pm.post_id)
			WHERE ";
			$sql .= $key == 'no' ? " pm.post_id NOT IN ( SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_pos' ) "  : " pm.meta_key = '_pos' AND pm.meta_value = '1' ";
			$sql .= "AND p.post_type = 'shop_order'
			AND p.post_status = 'publish'
			";
			$count = $wpdb->get_var($sql);

			$class 			= ( isset( $_GET['pos_order'] ) && $_GET['pos_order'] == $key ) ? 'current' : '';
			$query_string 	= remove_query_arg(array( 'pos_order' ));
			if( $class == '' ) $query_string = remove_query_arg(array( 'paged' ));
			$query_string 	= add_query_arg( 'pos_order', urlencode($key), $query_string );
			$views[$key] 	= '<a href="'. $query_string . '" class="' . esc_attr( $class ) . '">' . $label . ' <span class="count">(' . $count . ')</a></a>';
		}

		return $views;
	}


	function pre_get_posts( $query ) {
		$screen = get_current_screen();

		// product page
		if( is_admin() && get_query_var('post_type') == 'product' && $screen->base == 'edit' ) {
			
			if ( isset( $_GET['pos_visibility'] ) && !empty( $_GET['pos_visibility'] ) ) {
				$meta_query =  array(
					array(
						'key' 		=> '_pos_visibility',
						'value' 	=> $_GET['pos_visibility'],
						'compare'	=> '=='
					)
				);

				$query->set( 'meta_query', $meta_query );
			}
		}


		// order page
		if( is_admin() && get_query_var('post_type') === 'shop_order' && $screen->base == 'edit' ) {
			
			if ( isset( $_GET['pos_order'] ) && !empty( $_GET['pos_order'] ) ) {

				if( $_GET['pos_order'] == 'yes' ) {
					$meta_query =  array(
						array(
							'key' 		=> '_pos',
							'value' 	=> '1',
							'compare'	=> '=='
						)
					);
				}

				else {
					$meta_query =  array(
						array(
							'key' 		=> '_pos',
							'compare'	=> 'NOT EXISTS'
						)
					);
				}
				
				$query->set( 'meta_query', $meta_query );
			}
		}

	}

}

endif;

new WooCommerce_POS_Admin_Hooks();