<?php

/**
 * POS Product Class
 * duck punches the WC REST API
 *
 * @class    WC_POS_API_Products
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_API_Products extends WC_POS_API_Abstract {

  /**
   *
   */
  public function __construct() {
    add_filter( 'woocommerce_api_product_response', array( $this, 'product_response' ), 10, 4 );
    add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );

//    add_filter( 'woocommerce_api_edit_product_data', array($this, 'edit_product_data') );
  }

  /**
   * Remove variations from variable edit
   * todo: find the cause of this, perhaps due to sanitize_title($slug) below
   *
   * @param $data
   * @return array|mixed
   */
  public function edit_product_data($data){
    $data = parent::get_data();

    if( isset($data['type']) && $data['type'] == 'variable' ){
      unset( $data['variations'] );
    }

    return $data;
  }

  /**
   * Filter each product response from WC REST API for easier handling by the POS
   * - use the thumbnails rather than fullsize
   * - add barcode field
   * - unset unnecessary data
   *
   * @param  array $product_data
   * @param $product
   *
   * @return array modified data array $product_data
   */
  public function product_response( $product_data, $product, $fields, $server ) {

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

    // use thumbnails for images
    if( $thumb_id = get_post_thumbnail_id( $product_data['id'] ) ) {
      $image = wp_get_attachment_image_src( $thumb_id, 'shop_thumbnail' );
      $product_data['featured_src'] = $image[0];
    } else {
      $product_data['featured_src'] = wc_placeholder_img_src();
    }

    // add special key for barcode, defaults to sku
    // TODO: add an option for any meta field
    $product_data['barcode'] = $product_data['sku'];

    // deep dive on variations
    if( $product_data['type'] == 'variable' ) {

      // Woo handling of variation labels is FUBAR
      // create assoc array of options so we can reconstruct for variation
      // todo: sanitize_title on slug causes error on variable edit?
      foreach( $product_data['attributes'] as &$attribute ){
        $attribute['slug'] = sanitize_title( $attribute['name'] );
        $labels = array();
        foreach( $attribute['options'] as $key => $option){
          $labels[$key]['slug'] = sanitize_title( $option );
          $labels[$key]['name'] = $option;
        }
        $attribute['labels'] = $labels;
      }

      foreach( $product_data['variations'] as &$variation ) {

        // remove keys
        foreach($removeKeys as $key) {
          unset($variation[$key]);
        }

        // add featured_src
        if( $thumb_id = get_post_thumbnail_id( $variation['id'] ) ) {
          $image = wp_get_attachment_image_src( $thumb_id, 'shop_thumbnail' );
          $variation['featured_src'] = $image[0];
        } else {
          $variation['featured_src'] = $product_data['featured_src'];
        }

        // add special key for barcode, defaults to sku
        // TODO: add an option for any meta field
        $variation['barcode'] = $variation['sku'];

      }
    }

    return $product_data;
  }

  public function pre_get_posts($query){

    // store original meta_query
    $meta_query = $query->get( 'meta_query' );

    if( isset( $_GET['filter'] ) ){

      $filter = $_GET['filter'];

      // barcode
      // todo: allow users to set custom meta field
      if( isset($filter['barcode']) ){
        $meta_query[] = array(
          'key' 		=> '_sku',
          'value' 	=> $filter['barcode'],
          'compare'	=> 'LIKE'
        );
      }

      // featured
      // todo: more general meta_key test using $query_args_whitelist
      if( isset($filter['featured']) ){
        $meta_query[] = array(
          'key' 		=> '_featured',
          'value' 	=> $filter['featured'] ? 'yes' : 'no',
          'compare'	=> '='
        );
      }

      // on sale
      // - no easy way to get on_sale items
      // - wc_get_product_ids_on_sale uses cached data, includes variations
      if( isset($filter['on_sale']) ){
        $sale_ids = array_filter( wc_get_product_ids_on_sale() );
        $exclude = isset($query->query['post__not_in']) ? $query->query['post__not_in'] : array();
        $ids = array_diff($sale_ids, $exclude);
        $query->set( 'post__not_in', array() );
        $query->set( 'post__in', $ids );
      }

    }

    // update the meta_query
    $query->set( 'meta_query', $meta_query );

  }

  /**
   * Returns array of all product ids
   * @param $updated_at_min
   * @return array
   */
  static public function get_ids($updated_at_min){
    $args = array(
      'post_type'     => array('product'),
      'post_status'   => array('publish'),
      'posts_per_page'=>  -1,
      'fields'        => 'ids'
    );

    if($updated_at_min){
      $args['date_query'][] = array(
        'column'    => 'post_modified_gmt',
        'after'     => $updated_at_min,
        'inclusive' => false
      );
    }

    $query = new WP_Query( $args );
    return array_map( 'intval', $query->posts );
  }

}