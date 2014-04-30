<?php

/**
 * Product Class
 *
 * Handles the product objects
 * 
 * @class 	  WooCommerce_POS_Product
 * @version   0.3
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Product {
	
	/**
	 * Returns an array of all products (including variations) ordered by best sellers
	 * TODO: clean up and optimise, this is a bit of a hack
	 * @return array
	 */
	public function get_all_products() {

		// get array of all products and variations, set to zero sales
		$args = array(
			'post_type'			=> array('product', 'product_variation'),
			'post_status' 		=> array('private', 'publish'),
			'posts_per_page' 	=> -1,
			'fields'			=> 'ids'
		);
		$products = get_posts( $args );
		$zero_sales = array();
		if($products) {
			foreach( $products as $product ) {
				$zero_sales[ $product ] = 0;
			}
		}
		
		// combine with best selling products and variations
		$product_sales = $this->get_best_sellers();
		$variation_sales = $this->get_best_sellers(array('product_id'=>'_variation_id'));
		$all_sales = $variation_sales + $product_sales + $zero_sales;
		
		// sort array and return best selling products and variations
		asort( $all_sales );
		$best_sellers = array_reverse( $all_sales, true );

		// set up the return array
		$return_arr = array();

		foreach ( $best_sellers as $id => $sales ) {

			// get product object using global wc function
			$product = get_product( $id );

			// don't show the parents of variants
			if( !$product->is_type( 'variable' ) ) {

				// strip out the information we need
				$item = array(
					'id'	=> $id, // NOTE: this could be either product or variation id
					'img' 	=> $product->get_image(),
					'title' => $product->get_title(),
					'stock' => $product->get_stock_quantity(),
					'price' => $product->get_price_html()
				);

				// add variation_id for variants
				if( $product->is_type('variation') ) {
					$item_data = array(
						'parent_id'			=> $product->parent->id,
						'variation_id'		=> $product->variation_id,
						'variation_data'	=> $this->get_item_data($product->variation_data)
					);

					// merge variant data, will overwrite id
					$item = array_merge( $item, $item_data);
				}
					
				// push onto the return array
				array_push($return_arr, $item);
			}
		}

		return $return_arr;
	}

	/**
	 * Gets and formats a list of cart item data + variations for display on the frontend.
	 * Code taken from WC_Cart->get_item_data()
	 * @param  [type] $variation_data [description]
	 * @return [type]                 [description]
	 */
	public function get_item_data($variation_data) {
		$item_data = array();

		foreach ( $variation_data as $name => $value ) {

			if ( '' === $value )
				continue;

			$taxonomy = wc_attribute_taxonomy_name( str_replace( 'attribute_pa_', '', urldecode( $name ) ) );

			// If this is a term slug, get the term's nice name
            if ( taxonomy_exists( $taxonomy ) ) {
            	$term = get_term_by( 'slug', $value, $taxonomy );
            	if ( ! is_wp_error( $term ) && $term && $term->name ) {
            		$value = $term->name;
            	}
            	$label = wc_attribute_label( $taxonomy );

            // If this is a custom option slug, get the options name
            } else {
				$value              = apply_filters( 'woocommerce_variation_option_name', $value );
				$product_attributes = $cart_item['data']->get_attributes();
				if ( isset( $product_attributes[ str_replace( 'attribute_', '', $name ) ] ) ) {
					$label = wc_attribute_label( $product_attributes[ str_replace( 'attribute_', '', $name ) ]['name'] );
				} else {
					$label = $name;
				}
			}

			$item_data[] = array(
				'key'   => $label,
				'value' => $value
			);
		}

		return $item_data;
	}
	
	/**
	 * Get best sellers from the last 30 days
	 * @param  array $args
	 * @return array
	 */
	public function get_best_sellers($args='') {
		global $wpdb;
		
		$defaults = array(
			'start_date'	=> date( 'Ymd', strtotime( '-30 days' ) ),
			'end_date'		=> date( 'Ymd', current_time( 'timestamp' ) ),
			'order_statuses'=> array( 'completed', 'processing', 'on-hold' ),
			'product_id' 	=> '_product_id'
		);

		$args = wp_parse_args( $args, $defaults );

		extract( $args );
		
		$start_date = strtotime( $start_date );
		$end_date = strtotime( $end_date );
		$order_statuses = implode("','", $order_statuses);
		
		$order_items = $wpdb->get_results("
			SELECT order_item_meta_2.meta_value as product_id, SUM( order_item_meta.meta_value ) as item_quantity FROM {$wpdb->prefix}woocommerce_order_items as order_items
			LEFT JOIN {$wpdb->prefix}woocommerce_order_itemmeta as order_item_meta ON order_items.order_item_id = order_item_meta.order_item_id
			LEFT JOIN {$wpdb->prefix}woocommerce_order_itemmeta as order_item_meta_2 ON order_items.order_item_id = order_item_meta_2.order_item_id
			LEFT JOIN {$wpdb->posts} AS posts ON order_items.order_id = posts.ID
			LEFT JOIN {$wpdb->term_relationships} AS rel ON posts.ID = rel.object_ID
			LEFT JOIN {$wpdb->term_taxonomy} AS tax USING( term_taxonomy_id )
			LEFT JOIN {$wpdb->terms} AS term USING( term_id )
			WHERE 	posts.post_type 	= 'shop_order'
			AND 	posts.post_status 	= 'publish'
			AND 	tax.taxonomy		= 'shop_order_status'
			AND		term.slug			IN ('" . $order_statuses . "')
			AND 	post_date > '" . date('Y-m-d', $start_date ) . "'
			AND 	post_date < '" . date('Y-m-d', strtotime('+1 day', $end_date ) ) . "'
			AND 	order_items.order_item_type = 'line_item'
			AND 	order_item_meta.meta_key = '_qty'
			AND 	order_item_meta_2.meta_key = '" . $product_id . "'
			GROUP BY order_item_meta_2.meta_value
		");
		
		$found_products = array();

		if ( $order_items ) {
			foreach ( $order_items as $order_item ) {
				if($order_item->product_id) $found_products[ $order_item->product_id ] = $order_item->item_quantity;
			}
		}
		
		return $found_products;
	}
	
	/**
	 * Remove required fields so we process cart with out address
	 * @param  array $address_fields
	 * @return array
	 */
	public function pos_remove_required_fields( $address_fields ) {
		$address_fields['billing_first_name']['required'] = false;
		$address_fields['billing_last_name']['required'] = false;
		$address_fields['billing_company']['required'] = false;
		$address_fields['billing_address_1']['required'] = false;
		$address_fields['billing_address_2']['required'] = false;
		$address_fields['billing_city']['required'] = false;
		$address_fields['billing_postcode']['required'] = false;
		$address_fields['billing_country']['required'] = false;
		$address_fields['billing_state']['required'] = false;
		$address_fields['billing_email']['required'] = false;
		$address_fields['billing_phone']['required'] = false;
		return $address_fields;
	}
	
	/**
	 * After order has been processed successfully
	 * @param  int $order_id
	 * @param  [type] $posted
	 */
	public function pos_order_processed($order_id, $posted) {
		if(!empty($_POST['pos_receipt']) && !wp_verify_nonce($_POST['woocommerce-pos_receipt'],'woocommerce-pos_receipt')) {
			global $order_id;
			WC()->cart->empty_cart();
			exit;
		} else {
			return;
		}
	}
	
	/**
	 * Get Add to Cart link for POS
	 * @param  object $product
	 */
	public function get_pos_add_to_cart_url($product) {
		if ( $product->is_type('variation') ) {
			$url = remove_query_arg( 'added-to-cart', add_query_arg( array_merge( array( 'variation_id' => $product->variation_id, 'add-to-cart' => $product->id ), $product->variation_data ) ) );
		} else {
			$url = remove_query_arg( 'added-to-cart', add_query_arg( 'add-to-cart', $product->id ) );
		}
		return apply_filters( 'woocommerce_product_add_to_cart_url', $url, $product );
	}

	/**
	 * Output headers for JSON requests
	 */
	private function json_headers() {
		header( 'Content-Type: application/json; charset=utf-8' );
	}

}