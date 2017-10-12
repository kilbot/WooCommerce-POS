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

class WC_POS_APIv2_Products extends WC_POS_APIv2_Abstract {

  /**
   * Product fields used by the POS
   * @var array
   */
  private $whitelist = array(
    'id',
    'title', // backward compat
    'name',
    'slug',
    'permalink',
    'date_created', 'created_at',
    'date_created_gmt',
    'date_modified', 'updated_at',
    'date_modified_gmt',
    'type',
    'status',
    'featured',
    //    'catalog_visibility',
    //    'description',
    //    'short_description',
    'sku',
    'price',
    'regular_price',
    'sale_price',
    'date_on_sale_from',
    'date_on_sale_from_gmt',
    'date_on_sale_to',
    'date_on_sale_to_gmt',
    //    'price_html',
    'on_sale',
    'purchaseable',
    'total_sales',
    'virtual',
    'downloadable',
    //    'downloads',
    //    'download_limit',
    //    'download_expiry',
    //    'external_url',
    //    'button_text',
    'tax_status', 'taxable',
    'tax_class',
    'manage_stock', 'managing_stock',
    'stock_quantity',
    'in_stock',
    'backorders',
    'backorders_allowed',
    'backordered',
    'sold_individually',
    //    'weight',
    //    'dimensions',
    'shipping_required',
    'shipping_taxable',
    'shipping_class',
    'shipping_class_id',
    //    'reviews_allowed',
    //    'average_rating',
    //    'rating_count',
    //    'related_ids',
    //    'upsell_ids',
    //    'cross_sell_ids',
    'parent_id',
    'purchase_note',
    'categories',
    'tags',
    //    'images',
    'attributes',
    'default_attributes',
    'variations',
    'grouped_products',
    'menu_order',
    //    'meta_data',


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
    add_filter( 'woocommerce_rest_prepare_product_object', array( $this, 'product_response' ), 10, 3 );
    add_filter( 'woocommerce_rest_prepare_product_variation_object', array( $this, 'product_response' ), 10, 3 );
    add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );
    add_filter( 'posts_where', array( $this, 'posts_where' ), 10 , 2 );
    add_filter( 'posts_search', array( $this, 'search_by_title' ), 99, 2 );
  }

  /**
   * Filter each product response from WC REST API for easier handling by the POS
   * - use the thumbnails rather than fullsize
   * - add barcode field
   * - unset unnecessary data
   *
   * @param $response
   * @param $product
   *
   * @return array modified data array $product_data
   */
  public function product_response( $response, $product, $request ) {
    $data = $response->get_data();
    $type = isset( $data['type'] ) ? $data['type'] : '';

    if( $type == 'variable' ) :
      // nested variations
      foreach( $data['variations'] as &$variation ) :
        $response = WC()->api->WC_REST_Product_Variations_Controller->get_item(
          array(
            'id' => $variation,
            'product_id' => $variation
          )
        );
        $variation = $response->get_data();
      endforeach;
    endif;


//
//    // variable products
//    if( $type == 'variable' ) :
//      // nested variations
//      foreach( $data['variations'] as &$variation ) :
//        $_product = wc_get_product( $variation['id'] );
//        $variation = $this->filter_response_data( $variation, $_product );
//        $variation['attributes'] = $this->patch_variation_attributes( $_product );
//      endforeach;
//    endif;
//
//    // variation
//    if( $type == 'variation' ) :
//      $data['attributes'] = $this->patch_variation_attributes( $product );
//    endif;

    $data = $this->filter_response_data( $data, $product );

    $response->set_data($data);
    return $response;
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
    $id = isset( $data['id'] ) ? $data['id'] : '';
    $barcode = isset( $data['sku'] ) ? $data['sku'] : '';

    // allow custom barcode field
    $barcode_meta_key = apply_filters( 'woocommerce_pos_barcode_meta_key', '_sku' );
    if( $barcode_meta_key !== '_sku' ){
      $barcode = get_post_meta( $id, $barcode_meta_key, true );
    }

    $data['featured_src'] = $this->get_thumbnail( $id );
    $data['barcode'] = apply_filters( 'woocommerce_pos_product_barcode', $barcode, $id );

    // allow decimal stock quantities, fixed in WC 2.4
    if( version_compare( WC()->version, '2.4', '<' ) ){
      $data['stock_quantity'] = $product->get_stock_quantity();
    }

    // backwards compatibility
    if( isset($data['date_modified']) ) {
      $data['updated_at'] = $data['date_modified'];
    }

    if( isset($data['manage_stock']) ) {
      $data['managing_stock'] = $data['manage_stock'];
    }

    if( isset($data['tax_status']) ) {
      $data['taxable'] = $data['tax_status'] == 'taxable';
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
    // order product alphabetically
    $query->set('orderby', 'post_title');
    $query->set('order', 'ASC');

    // default post_status is any!
    $query->set( 'post_status', 'publish' );
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

        $barcode_meta_key = apply_filters( 'woocommerce_pos_barcode_meta_key', '_sku' );

        // gets post ids and parent ids
        $result = $wpdb->get_results(
          $wpdb->prepare("
            SELECT p.ID, p.post_parent
            FROM $wpdb->posts AS p
            JOIN $wpdb->postmeta AS pm
            ON p.ID = pm.post_id
            WHERE pm.meta_key = %s
            AND pm.meta_value LIKE %s
          ", $barcode_meta_key, '%'.$filter['barcode'].'%' ),
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
   * Search SQL filter for matching against post title only.
   *
   * @link    http://wordpress.stackexchange.com/a/11826/1685
   *
   * @param   string   $search
   * @param   WP_Query $wp_query
   * @return array|string
   */
  function search_by_title( $search, $wp_query ) {
    if ( ! empty( $search ) && ! empty( $wp_query->query_vars['search_terms'] ) ) {
      global $wpdb;

      $q = $wp_query->query_vars;
      $n = ! empty( $q['exact'] ) ? '' : '%';

      $search = array();

      foreach ( ( array ) $q['search_terms'] as $term )
        $search[] = $wpdb->prepare( "$wpdb->posts.post_title LIKE %s", $n . $wpdb->esc_like( $term ) . $n );

      if ( ! is_user_logged_in() )
        $search[] = "$wpdb->posts.post_password = ''";

      $search = ' AND ' . implode( ' AND ', $search );
    }

    return $search;
  }


  /**
   * Returns array of all product ids
   * @param $date_modified
   * @return array
   */
  public function get_ids($date_modified){
    $args = array(
      'post_type'     => array('product'),
      'post_status'   => array('publish'),
      'posts_per_page'=>  -1,
      'fields'        => 'ids'
    );

    if($date_modified){
      $args['date_query'][] = array(
        'column'    => 'post_modified',
        'after'     => $date_modified,
        'inclusive' => false
      );
    }

    $query = new WP_Query( $args );
    return array_map( 'intval', $query->posts );
  }

}
