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

namespace WC_POS\API;

use WC_API_Resource;
use WC_API_Server;

class Products extends WC_API_Resource {

  /** @var string $base the route base */
  protected $base = '/products';

  /* @var string Barcode postmeta */
  public $barcode_meta_key;

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
   * @param WC_API_Server $server
   */
  public function __construct( WC_API_Server $server ) {
    parent::__construct( $server );

    // allow third party plugins to change the barcode postmeta field
    $this->barcode_meta_key = apply_filters( 'woocommerce_pos_barcode_meta_key', '_sku' );
    add_filter( 'woocommerce_api_product_response', array( $this, 'product_response' ), 10, 4 );

    if( $server->path === $this->base ){
      add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );
    }
  }


  /**
   * Register routes for POS Products
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( $routes ) {

    # GET /products/ids
    $routes[ $this->base . '/ids'] = array(
      array( array( $this, 'get_all_ids' ), WC_API_Server::READABLE ),
    );

    return $routes;
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
      // nested variations
      foreach( $data['variations'] as &$variation ) :
        $_product = wc_get_product( $variation['id'] );
        $variation = $this->filter_response_data( $variation, $_product );
        $variation['attributes'] = $this->patch_variation_attributes( $_product );
      endforeach;
    endif;

    // variation
    if( $type == 'variation' ) :
      $data['attributes'] = $this->patch_variation_attributes( $product );
    endif;

    return $this->filter_response_data( $data, $product );
  }


  /**
   * https://github.com/woothemes/woocommerce/issues/8457
   * patches WC_Product_Variable->get_variation_attributes()
   * @param $product
   * @return array
   */
  private function patch_variation_attributes( $product ){
    $patched_attributes = array();
    $attributes = $product->get_attributes();
    $variation_attributes = $product->get_variation_attributes();

    // patch for corrupted data, depreciate asap
    if( empty( $attributes ) ){
      $attributes = $product->parent->product_attributes;
      delete_post_meta( $product->variation_id, '_product_attributes' );
    }

    foreach( $variation_attributes as $slug => $option ){
      $slug = str_replace( 'attribute_', '', $slug );

      if( isset( $attributes[$slug] ) ){
        $patched_attributes[] = array(
          'name'    => $this->get_variation_name( $attributes[$slug] ),
          'option'  => $this->get_variation_option( $product, $attributes[$slug], $option )
        );
      }

    }

    return $patched_attributes;
  }


  /**
   * @param $attribute
   * @return null|string
   */
  private function get_variation_name( $attribute ){
    if( $attribute['is_taxonomy'] ){
      global $wpdb;
      $name = str_replace( 'pa_', '', $attribute['name'] );

      $label = $wpdb->get_var(
        $wpdb->prepare("
          SELECT attribute_label
          FROM {$wpdb->prefix}woocommerce_attribute_taxonomies
          WHERE attribute_name = %s;
        ", $name ) );

      return $label ? $label : $name;
    }

    return $attribute['name'];
  }


  /**
   * @param $product
   * @param $option
   * @param $attribute
   * @return mixed
   */
  private function get_variation_option( $product, $attribute, $option ){
    $name = $option;

    // taxonomy attributes
    if ( $attribute['is_taxonomy'] ) {
      $terms = wp_get_post_terms( $product->parent->id, $attribute['name'] );
      if( !is_wp_error($terms) ) : foreach( $terms as $term ) :
        if( $option === $term->slug ) $name = $term->name;
      endforeach; endif;

    // piped attributes
    } else {
      $values = array_map( 'trim', explode( WC_DELIMITER, $attribute['value'] ) );
      $options = array_combine( array_map( 'sanitize_title', $values) , $values );
      if( $options && isset( $options[$option] ) ){
        $name = $options[$option];
      }
    }

    return $name;
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
    $barcode = get_post_meta( $product->id, $this->barcode_meta_key, true );

    $data['featured_src'] = $this->get_thumbnail( $product->id );
    $data['barcode'] = apply_filters( 'woocommerce_pos_product_barcode', $barcode, $product->id );

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
   * @param \WP_Query $wp_query
   */
  public function pre_get_posts(\WP_Query $wp_query){
    $query_array = isset($wp_query->query['s']) ? $wp_query->query['s'] : '';

    if(!is_array($query_array)){
      return;
    }

    foreach( $query_array as $query ){
      $this->parse_query_array($query, $wp_query);
    }
  }

  /**
   * @param array $query
   * @param \WP_Query $wp_query
   */
  private function parse_query_array( array $query, \WP_Query $wp_query){
    $type = isset($query['type']) ? $query['type'] : 'string';

    if($type == 'prefix' && isset($query['prefix']) && isset($query['query'])){
      $prefix = isset($query['prefix']) ? $query['prefix'] : '';
      $term = isset($query['query']) ? $query['query'] : '';
      $this->prefix_query($prefix, $term, $wp_query);
    }

  }

  /**
   * @param $prefix
   * @param $term
   * @param \WP_Query $wp_query
   */
  private function prefix_query( $prefix, $term, \WP_Query $wp_query){
    // store original meta_query
    $meta_query = $wp_query->get( 'meta_query' );
    $tax_query = $wp_query->get( 'tax_query' );

    // featured
    if($prefix == 'featured'){
      $meta_query[] = array(
        'key'     => '_featured',
        'value'   => $term == 'true' ? 'yes' : 'no',
        'compare' => '='
      );
    }

    // sku
    if($prefix == 'sku'){
      $meta_query[] = array(
        'key'     => '_sku',
        'value'   => $term,
        'compare' => 'LIKE'
      );
    }

    // barcode
    if($prefix == 'barcode'){
      $meta_query[] = array(
        'key'     => $this->barcode_meta_key,
        'value'   => $term,
        'compare' => 'LIKE'
      );
    }

    // on_sale
    if($prefix == 'on_sale'){
      $sale_ids = array_filter( wc_get_product_ids_on_sale() );
      if($term == 'true'){
        $include = isset($wp_query->query['post__in']) ? $wp_query->query['post__in'] : array();
        $wp_query->set( 'post__in', array_merge($include, $sale_ids) );
      } else {
        $exclude = isset($wp_query->query['post__not_in']) ? $wp_query->query['post__not_in'] : array();
        $wp_query->set( 'post__not_in', array_merge($exclude, $sale_ids) );
      }
    }

    // categories and cat (abbr)
    if($prefix == 'categories' || $prefix == 'cat'){
      $tax_query[] = array(
        'taxonomy' => 'product_cat',
        'field'    => 'slug',
        'terms'    => array( $term )
      );
    }

    $wp_query->set('meta_query', $meta_query);
    $wp_query->set('tax_query', $tax_query);

  }

  /**
   * Returns array of all product ids
   *
   * @param array $filter
   * @return array|void
   */
  public function get_all_ids( $filter = array() ){
    $args = array(
      'post_type'     => array('product'),
      'post_status'   => array('publish'),
      'posts_per_page'=> -1,
      'fields'        => 'ids'
    );

    if( isset( $filter['updated_at_min'] ) ){
      $args['date_query'][] = array(
        'column'    => 'post_modified_gmt',
        'after'     => $filter['updated_at_min'],
        'inclusive' => false
      );
    }

    $query = new \WP_Query( $args );
    return array( 'products' => array_map( array( $this, 'format_id' ), $query->posts ) );
  }

  /**
   * @param $id
   * @return array
   */
  private function format_id( $id ){
    return array( 'id' => (int) $id );
  }

}