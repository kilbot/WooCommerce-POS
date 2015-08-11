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
   * postmeta key to use for barcode
   * - defaults to '_sku'
   * - can be overwritten using the woocommerce_pos_barcode_meta_key filter
   * @var array
   */
  private $barcode_meta_key;

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
    add_filter( 'posts_where', array( $this, 'posts_where' ), 10 , 2 );

    $this->barcode_meta_key = apply_filters( 'woocommerce_pos_barcode_meta_key', '_sku' );
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
        if( $option == $term->slug ) $name = $term->name;
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
    $id = isset( $data['id'] ) ? $data['id'] : '';
    $barcode = isset( $data['sku'] ) ? $data['sku'] : '';

    // allow custom barcode field
    if( $this->barcode_meta_key !== '_sku' ){
      $barcode = get_post_meta( $id, $this->barcode_meta_key, true );
    }

    $data['featured_src'] = $this->get_thumbnail( $id );
    $data['barcode'] = apply_filters( 'woocommerce_pos_product_barcode', $barcode, $id );

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

      // barcode moved to posts_where for variation search
//      if( isset($filter['barcode']) ){
//        $meta_query[] = array(
//          'key' 		=> $this->barcode_meta_key,
//          'value' 	=> $filter['barcode'],
//          'compare'	=> 'LIKE'
//        );
//      }

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
   * @param $where
   * @param $query
   * @return mixed
   */
  public function posts_where( $where, $query ) {
    global $wpdb;

    if( isset( $_GET['filter'] ) ){

      $filter = $_GET['filter'];

      if( isset($filter['barcode']) ){

        // gets post ids and parent ids
        $result = $wpdb->get_results(
          $wpdb->prepare("
            SELECT p.ID, p.post_parent
            FROM $wpdb->posts AS p
            JOIN $wpdb->postmeta AS pm
            ON p.ID = pm.post_id
            WHERE pm.meta_key = %s
            AND pm.meta_value LIKE %s
          ", $this->barcode_meta_key, '%'.$filter['barcode'].'%' ),
          ARRAY_N
        );

        if($result){
          $ids = call_user_func_array('array_merge', $result);
          $where .= " AND ID IN (" . implode( ',', array_unique($ids) ) . ")";
        } else {
          // no matches
          $where .= " AND 1=0";
        }

      }

    }

    return $where;
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