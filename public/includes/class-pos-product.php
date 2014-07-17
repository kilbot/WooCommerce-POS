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
	public $thumb_size;

	/** @var array Contains an array of tax rates, by tax class. */
	public $tax_rates = array();


	public function __construct() {

		// init variables
		$this->thumb_size = get_option( 'shop_thumbnail_image_size', array( 'width' => 90, 'height' => 90 ) );

		// we're going to manipulate the wp_query to display POS products
		add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );

		// and we're going to filter on the way out
		add_filter( 'woocommerce_api_product_response', array( $this, 'filter_product_response' ), 10, 4 );

	}

	/**
	 * Get all the product ids 
	 * @return array
	 * TODO: there is a problem with updates returning the wrong result.
	 * product_variations do not modify their date in the database,
	 * either need a workaround based on parent_id, or submit change to wc
	 */
	public function get_all_ids() {

		// get all the ids
		$args = array(
			'post_type' 	=> array('product'),
			'posts_per_page'=>  -1,
			'fields'		=> 'ids',
		);

		// init WP_QUERY: uses pre_get_posts
		$query = new WP_Query( $args );
		return array_map( 'intval', $query->posts );
	}

	/**
	 * Make changes to the product query for POS
	 * @param  $query 		the wordpress query
	 */
	public function pre_get_posts( $query ) {

		// remove variable products
		$meta_query =  array(
			'relation' => 'OR',
			array(
				'key' 		=> '_pos_visibility',
				'value' 	=> 'pos_hidden',
				'compare'	=> '!='
			),
			array(
				'key' 		=> '_pos_visibility',
				'value' 	=> 'pos_hidden',
				'compare'	=> 'NOT EXISTS'
			)
		);
		$query->set( 'meta_query', $meta_query );
        
	}

	/**
	 * Filter product response from WC REST API for easier handling by the POS
	 * - separate variations from variable products
	 * - remove variable products
	 * - unset unnecessary data
	 * @param  array $product_data
	 * @return array modified data array $product_data
	 */
	public function filter_product_response( $product_data, $product, $fields, $server ) {

		// use thumbnails for images or placeholder
		if( $product_data['featured_src'] ) {
			$thumb_suffix = '-'.$this->thumb_size['width'].'x'.$this->thumb_size['height'];
			$product_data['featured_src'] = preg_replace('/(\.gif|\.jpg|\.png)/', $thumb_suffix.'$1', $product_data['featured_src']);

		} else {
			$product_data['featured_src'] = wc_placeholder_img_src();
		}
		
		// if taxable, get the tax_rates array
		if( $product_data['taxable'] ) {

			if( isset($this->tax_rates[$product_data['tax_class']]) ) {
				$tax_rates = $this->tax_rates[$product_data['tax_class']];
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
				$tax_rates = $tax->find_rates( array( 'country' => $country, 'state' => $state, 'tax_class' => $product_data['tax_class'] ) );
				$this->tax_rates[$product_data['tax_class']] = $tax_rates;
			}

			$product_data['tax_rates'] = $tax_rates;
			// error_log( print_R( $tax_rates, TRUE ) ); //debug
		}

		// add special key for barcode, defaults to sku
		// TODO: add an option for any meta field
		$product_data['barcode'] = $product_data['sku'];

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
			'images',
			'parent',
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

		return $product_data;
	}

}