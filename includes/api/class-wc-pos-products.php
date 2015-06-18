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
   * Product keys not currently used by the POS
   * - saves storage space in IndexedDB
   * - saves bandwidth transferring the data
   * - eg: removing 'description' reduces object size by ~25%
   * @var array
   */
  private $blacklist = array(
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

  /**
   *
   */
  public function __construct() {
    add_filter( 'woocommerce_api_product_response', array( $this, 'product_response' ), 10, 4 );
    add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );

    $general_settings = new WC_POS_Admin_Settings_General();
    if( $general_settings->get_data('decimal_qty') ){
      remove_filter('woocommerce_stock_amount', 'intval');
      add_filter( 'woocommerce_stock_amount', 'floatval' );
    }
  }

  /**
   * Filter each product response from WC REST API for easier handling by the POS
   * - use the thumbnails rather than fullsize
   * - add barcode field
   * - unset unnecessary data
   *
   * @param  array $data
   * @param $product
   *
   * @return array modified data array $product_data
   */
  public function product_response( $data, $product, $fields, $server ) {

    $data = $this->filter_response_data( $data );

    // allow decimal stock quantities
    // todo: this is required because wc api forces stock_quantity to (int)
    $data['stock_quantity'] = $product->get_stock_quantity();

    // deep dive on variations
    $type = isset( $data['type'] ) ? $data['type'] : '';
    if( $type == 'variable' ) :
      foreach( $data['variations'] as &$variation ) :
        $variation = $this->filter_response_data( $variation );
      endforeach;
    endif;

    return $data;
  }

  /**
   * Filter product response data
   * - remove some unnecessary keys
   * - add featured_src
   * - add special key for barcode, defaults to sku
   * @param array $data
   * @return array
   */
  private function filter_response_data( array $data ){
    $id = isset( $data['id'] ) ? $data['id'] : '';
    $sku = isset( $data['sku'] ) ? $data['sku'] : '';

    $data['featured_src'] = $this->get_thumbnail( $id );
    $data['barcode'] = apply_filters( 'woocommerce_pos_product_barcode', $sku, $id );
    return array_diff_key( $data, array_flip( $this->blacklist ) );
  }

  /**
   * Returns thumbnail if it exists, if not, returns the WC placeholder image
   * @param int $id
   * @return string
   */
  private function get_thumbnail($id){
    if( $thumb_id = get_post_thumbnail_id( $id ) ) {
      $image = wp_get_attachment_image_src( $thumb_id, 'shop_thumbnail' );
      return $image[0];
    }
    return wc_placeholder_img_src();
  }

  /**
   * @param $query
   */
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