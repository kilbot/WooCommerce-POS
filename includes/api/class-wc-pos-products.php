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
   * Product fields used by the POS
   * @var array
   */
  private $whitelist = array(
    'title',
    'id',
    'created_at',
    'updated_at',
    'type',
    'status',
    'downloadable',
    'virtual',
//    'permalink',
    'sku',
    'price',
    'regular_price',
    'sale_price',
    'price_html',
    'taxable',
    'tax_status',
    'tax_class',
    'managing_stock',
    'stock_quantity',
    'in_stock',
    'backorders_allowed',
    'backordered',
    'sold_individually',
    'purchaseable',
    'featured',
    'visible',
//    'catalog_visibility',
    'on_sale',
//    'weight',
//    'dimensions',
    'shipping_required',
    'shipping_taxable',
    'shipping_class',
    'shipping_class_id',
//    'description',
//    'short_description',
//    'reviews_allowed',
//    'average_rating',
//    'rating_count',
//    'related_ids',
//    'upsell_ids',
//    'cross_sell_ids',
    'parent_id',
    'categories',
//    'tags',
//    'images',
    'featured_src',
    'attributes',
//    'downloads',
//    'download_limit',
//    'download_expiry',
//    'download_type',
    'purchase_note',
    'total_sales',
    'variations',
//    'parent',

    /**
     * Fields add by POS
     * - product thumbnail
     * - barcode
     */
    'featured_src',
    'barcode'
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
    $type = isset( $data['type'] ) ? $data['type'] : '';

    // variable products
    if( $type == 'variable' ) :
      $data['attributes'] = $this->patch_variable_attributes($data['attributes']);

      // nested variations
      foreach( $data['variations'] as &$variation ) :
        $_product = wc_get_product( $variation['id'] );
        $variation = $this->filter_response_data( $variation, $_product );
        $variation['attributes'] = $this->patch_variation_attributes( $variation['attributes'], $data['attributes'] );
      endforeach;
    endif;

    // variation
    if( $type == 'variation' ) :
      $data['attributes'] = $this->patch_variation_attributes( $data['attributes'], $data['parent']['attributes'] );
    endif;

    return $this->filter_response_data( $data, $product );
  }

  /**
   * https://github.com/woothemes/woocommerce/issues/8457
   * - sanitize the attribute slug
   * @param array $attributes
   * @return array
   */
  private function patch_variable_attributes(array $attributes){
    foreach( $attributes as &$attribute ) :
      if( isset($attribute['slug']) ) $attribute['slug'] = sanitize_title($attribute['slug']);
    endforeach;
    return $attributes;
  }

  /**
   * https://github.com/woothemes/woocommerce/issues/8457
   * - restore the correct attribute name
   * - add label
   * @param array $attributes
   * @param $parent_attributes
   * @return array
   */
  private function patch_variation_attributes(array $attributes, array $parent_attributes){
    foreach( $attributes as &$attribute ) :
      foreach($parent_attributes as $attr){
        if( $attribute['slug'] == sanitize_title( $attr['slug'] ) ){
          $attribute['name'] = $attr['name'];
          $option_slugs = array_map( 'sanitize_title', $attr['options'] );
          $key = array_search( $attribute['option'], $option_slugs );
          $attribute['label'] = $attr['options'][$key];
          break;
        }
      }
    endforeach;
    return $attributes;
  }

  /**
   * Filter product response data
   * - add featured_src
   * - add special key for barcode, defaults to sku
   * @param array $data
   * @param $product
   * @return array
   */
  private function filter_response_data( array $data, $product ){
    $id = isset( $data['id'] ) ? $data['id'] : '';
    $sku = isset( $data['sku'] ) ? $data['sku'] : '';

    $data['featured_src'] = $this->get_thumbnail( $id );
    $data['barcode'] = apply_filters( 'woocommerce_pos_product_barcode', $sku, $id );

    // allow decimal stock quantities, fixed in WC 2.4
    if( version_compare( WC()->version, '2.4', '<' ) ){
      $data['stock_quantity'] = $product->get_stock_quantity();
    }

    // filter by whitelist
    // - note, this uses the same method as WC REST API fields parameter
    // - this doesn't speed up queries as it should
    // - when WC REST API properly filters requests POS should use fields param
    return array_intersect_key( $data, array_flip( $this->whitelist ) );
  }

  /**
   * Returns thumbnail if it exists, if not, returns the WC placeholder image
   * @param int $id
   * @return string
   */
  private function get_thumbnail($id){
    $image = false;
    $thumb_id = get_post_thumbnail_id( $id );

    if( $thumb_id )
      $image = wp_get_attachment_image_src( $thumb_id, 'shop_thumbnail' );

    if( is_array($image) )
      return $image[0];

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