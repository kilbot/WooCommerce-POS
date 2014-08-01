<?php

/**
 * WC Products Admin Class
 *
 * Handles any changes to the WC Product Admin screens
 * 
 * @class 	  WooCommerce_POS_Products_Admin
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( ! class_exists( 'WooCommerce_POS_Products_Admin' ) ) :

class WooCommerce_POS_Products_Admin {

	/**
	 * Constructor
	 */
	public function __construct() {

		// add POS visibility
		add_action( 'post_submitbox_misc_actions', array( $this, 'pos_visibility' ), 99 );

		// Bump modified times
		add_action( 'save_post_product', array( $this, 'product_updated' ), 10, 1 );
	}

	/**
	 * Outputs POS visibility options to the product edit page
	 */
	public function pos_visibility() {
		global $post;

		if ( 'product' != $post->post_type ) {
			return;
		}

		$current_visibility = ( $current_visibility = get_post_meta( $post->ID, '_pos_visibility', true ) ) ? $current_visibility : 'pos_and_online';

		$visibility_options = array(
			'pos_and_online' => __( 'POS & Online', 'woocommerce-pos' ),
			'pos_only' => __( 'POS Only', 'woocommerce-pos' ),
			'online_only' => __( 'Online Only', 'woocommerce-pos' )
		);

		$i  = 0;
		foreach ( $visibility_options as $name => $label ) {
			$selected = $current_visibility === $name;
			$pos_params[$i] = array(
				'name' => $name,
				'label' => $label,
				'selected' => $selected
			);
			$i++;
		}

		echo '<div id="pos-visibility" class="misc-pub-section">
		'. __( 'POS visibility', 'woocommerce-pos' ) .': <strong id="pos-visibility-display">'. $visibility_options[$current_visibility] .'</strong> <a href="#" class="action-edit">Edit</a> <span class="spinner"></span>
		<div id="pos-visibility-select" style="display:none;padding-top:1em;"></div>
		</div>';

		echo '
		<script type="text/javascript">
			pos_params.post_id = ' . $post->ID . ';
			pos_params.visibility_nonce = "' . wp_create_nonce( 'set-product-visibilty-' . $post->ID ) . '";
			pos_params.visibility = ' . json_encode($pos_params) . ';
		</script>
		<script type="text/template" id="tmpl-pos-visibility">
		<% _.each( options, function(option) { %> 
		<input type="radio" name="_pos_visibility" value="<%= option.name %>" id="_pos_visibility<%= option.name %>" <% if(option.selected) { %>checked<% } %>>
		<label for="_pos_visibility<%= option.name %>"><%= option.label %></label><br>
		<% }); %>
		<p><a href="#pos-visibility" class="button action-save">OK</a> <a href="#pos-visibility" class="action-cancel">Cancel</a></p>
		</script>';
	}

	/**
	 * Bump variation modified time if parent is modified
	 * @param  $post_ID the variable product id
	 */
	public function product_updated( $post_ID ) {
		$product = get_product( $post_ID );
		if( $product->is_type( 'variable' ) && $product->has_child() ) {

			$post_modified     = current_time( 'mysql' );
			$post_modified_gmt = current_time( 'mysql', 1 );

			foreach ( $product->get_children() as $child_id ) {
				wp_update_post( array(
					'ID' 				=> $child_id,
					'post_modified' 	=> $post_modified,
					'post_modified_gmt' => $post_modified_gmt
				));
			}
		}
	}

}

endif;

new WooCommerce_POS_Products_Admin();