<?php

/**
 * Product Class
 *
 * Handles the products
 * 
 * @class 	  WooCommerce_POS_Product
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Product {

	/** @var string Contains the thumbnail size. */
	private $thumb_suffix = null;

	/** @var string Contains placeholder image src. */
	private $placeholder_img = null;

	/** @var array Contains an array of tax rates, by tax class. */
	private $tax_rates = array();

	/**
	 * Initialize WooCommerce_POS_Product
	 */
	public function __construct() {

		// hooks
		add_filter( 'posts_where', array( $this, 'posts_where' ), 10 , 2 );
		add_filter( 'woocommerce_api_product_response', array( $this, 'filter_product_response' ), 10, 4 );

		// server fallback, depreciate asap
		add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );

	}

	/**
	 * Show/hide POS products
	 */
	public function posts_where( $where, $query ) {
		global $wpdb;

		// only alter product queries
		if( is_array( $query->get('post_type') ) && !in_array( 'product', $query->get('post_type') ) )
			return $where;

		if( !is_array( $query->get('post_type') ) && $query->get('post_type') !== 'product' ) 
			return $where;

		// don't alter product queries in the admin
		if( is_admin() && !WC_POS()->is_pos ) 
			return $where;

		// hide products
		if( WC_POS()->is_pos ) {
			$hide = 'online_only';
		} else {
			$hide = 'pos_only';
		}

		$where .= " AND ID NOT IN (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_pos_visibility' AND meta_value = '$hide')";

		return $where;

	}

	/**
	 * Filter products, server fallback
	 */
	public function pre_get_posts( $query ) {

		if( !WC_POS()->is_pos || $query->get('post_type') !== 'product' ) 
			return;	

		$meta_query = $query->get( 'meta_query' );

		// server filter
		// TODO: this needs to be replaced by WC API 2.2
        if( isset( $_GET['filter'] ) ) {
        
        	// barcode 
        	if( array_key_exists( 'barcode', $_GET['filter'] ) ) {
		  		$meta_query[] = array(
					'key' 		=> '_sku',
					'value' 	=> $_GET['filter']['barcode'],
					'compare'	=> '='
				);
				$query->set( 'post_type', array('product', 'product_variation' ) );
        	}

        	// variations
        	if( array_key_exists( 'parent', $_GET['filter'] ) ) {
        		$query->set( 'post_type', 'product_variation' );
        		$query->set( 'post_parent', $_GET['filter']['parent'] );
        	}

        	// featured
			if( array_key_exists( 'featured', $_GET['filter'] ) && $_GET['filter']['featured'] ) {
		  		$meta_query[] = array(
					'key' 		=> '_featured',
					'value' 	=> 'yes',
					'compare'	=> '='
				);
        	}
        }

        // update the meta_query
        $query->set( 'meta_query', $meta_query );

	}

	/**
	 * Filter each product response from WC REST API for easier handling by the POS
	 * - use the thumbnails rather than fullsize
	 * - add tax rates & barcode field
	 * - unset unnecessary data
	 * @param  array $product_data
	 * @return array modified data array $product_data
	 */
	public function filter_product_response( $product_data, $product, $fields, $server ) {

		// only filter requests from POS
		if( !WC_POS()->is_pos ) {
			return $product_data;
		}

		// remove some unnecessary keys
		// - saves storage space in IndexedDB
		// - saves bandwidth transferring the data
		// eg: removing 'description' reduces object size by ~25%
		$removeKeys = array(
			'average_rating',
			'cross_sell_ids',
			'description',
			'dimensions', 
			'download_expiry',
			'download_limit',
			'download_type',
			'downloads',
			'image',
			'images',
			'rating_count',
			'related_ids',
			'reviews_allowed',
			'shipping_class',
			'shipping_class_id',
			'shipping_required',
			'shipping_taxable',
			'short_description',
			'tags',
			'upsell_ids',
			'weight',
		);
		foreach($removeKeys as $key) {
			unset($product_data[$key]);
		}

		// set thumb_suffix
		if( $this->thumb_suffix === null ) {
			$thumb_size = get_option( 'shop_thumbnail_image_size', array( 'width' => 90, 'height' => 90 ) );
			$this->thumb_suffix = '-'.$thumb_size['width'].'x'.$thumb_size['height'];
		}

		// set placeholder
		if( $this->placeholder_img === null ) {
			$this->placeholder_img = wc_placeholder_img_src();
		} 

		// use thumbnails for images
		$xpath = new DOMXPath(@DOMDocument::loadHTML($product->get_image()));
		$product_data['featured_src'] = $xpath->evaluate("string(//img/@src)");

		// if taxable, get the tax_rates array
		if( $product_data['taxable'] ) {
			$product_data['tax_rates'] = $this->get_tax_rates( $product_data['tax_class'] );
		}

		// add special key for barcode, defaults to sku
		// TODO: add an option for any meta field
		$product_data['barcode'] = $product_data['sku'];

		// deep dive on variations
		if( $product_data['type'] == 'variable' ) {

			foreach( $product_data['variations'] as &$variation ) {

				// remove keys
				foreach($removeKeys as $key) {
					unset($variation[$key]);
				}

				// add taxes
				if( $product_data['taxable'] ) {
					$variation['tax_rates'] = $this->get_tax_rates( $variation['tax_class'] );
				}

				// add featured_src
				if ( has_post_thumbnail( $variation['id'] ) ) {
					$image = get_the_post_thumbnail( $variation['id'], 'shop_thumbnail' );
					$xpath = new DOMXPath(@DOMDocument::loadHTML($image));
					$variation['featured_src'] = $xpath->evaluate("string(//img/@src)");
				} else {
					$variation['featured_src'] = $product_data['featured_src'];
				}

				// add special key for barcode, defaults to sku
				// TODO: add an option for any meta field
				$variation['barcode'] = $variation['sku'];

				// add stock management from parent
				$variation['managing_stock'] = $product_data['managing_stock'];

			}
		}

		return $product_data;
	}

	/**
	 * [get_tax_rates description]
	 * @return [type] [description]
	 */
	public function get_tax_rates( $tax_class = '' ) {

		if( isset($this->tax_rates[$tax_class]) ) {
			return $this->tax_rates[$tax_class];
		} 

		else {
			$tax = new WC_Tax();
			$base = get_option( 'woocommerce_default_country' );
			if ( strstr( $base, ':' ) ) {
				list( $country, $state ) = explode( ':', $base );
			} else {
				$country = $base;
				$state = '';
			}
			$tax_rates = $tax->find_rates( array( 'country' => $country, 'state' => $state, 'tax_class' => $tax_class ) );
			$this->tax_rates[$tax_class] = $tax_rates;
			return $tax_rates;
		}

	}

}

new WooCommerce_POS_Product();