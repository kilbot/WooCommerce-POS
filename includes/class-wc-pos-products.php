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

class WC_POS_Products {

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();

    add_action( 'woocommerce_product_set_stock', array( $this, 'product_set_stock') );
  }

  /**
   * Load Product subclasses
   */
  private function init() {

    // pos only products
    $settings = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'general' );
    if( isset( $settings['pos_only_products'] ) && $settings['pos_only_products'] ) {
      new WC_POS_Products_Visibility();
    }
  }

  /**
   * Bump modified date on stock change
   * @param $product
   */
  public function product_set_stock($product){
    $post_modified     = current_time( 'mysql' );
    $post_modified_gmt = current_time( 'mysql', 1 );
    wp_update_post( array(
      'ID'                => $product->id,
      'post_modified'     => $post_modified,
      'post_modified_gmt' => $post_modified_gmt
    ));
  }

}