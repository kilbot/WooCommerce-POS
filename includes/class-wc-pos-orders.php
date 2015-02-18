<?php

/**
 * POS Orders Class
 *
 * @class    WC_POS_Orders
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Orders {

  /** @var array Contains the raw order data */
  private $data = array();

  /**
   * Constructor
   */
  public function __construct() {
    if( ! is_pos() )
      return;

    add_filter( 'woocommerce_api_create_order_data', array( $this, 'create_order_data'), 10, 2 );
    add_action( 'woocommerce_order_add_product', array( $this, 'order_add_product'), 10, 5 );
    add_action( 'woocommerce_api_create_order', array( $this, 'create_order'), 10, 2 );

    // payment complete
    add_action( 'woocommerce_payment_complete', array( $this, 'payment_complete' ), 10, 1 );

    // add payment info to order response
    add_filter( 'woocommerce_api_order_response', array( $this, 'order_response' ), 10, 4 );
  }

  /**
   * Store raw data for use by payment gateways
   * @param $data
   * @param $WC_API_Orders
   * @return array data
   */
  public function create_order_data( $data, $WC_API_Orders ) {

    // get raw data from request body
    $this->data = json_decode(trim(file_get_contents('php://input')), true);
    unset($this->data['status']);
    return $this->data;

  }

  /**
   * Line item meta
   * @param $order_id
   * @param $item_id
   * @param $product
   * @param $qty
   * @param $args
   */
  public function order_add_product( $order_id, $item_id, $product, $qty, $args ) {
    $item_meta = $this->get_line_meta($product->id);
    if($item_meta): foreach($item_meta as $meta):
      $label = isset($meta['label']) ? $meta['label'] : '';
      $value = isset($meta['value']) ? $meta['value'] : '';
      wc_add_order_item_meta($item_id, $label, $value);
    endforeach; endif;
  }

  private function get_line_meta($product_id){
    if(!isset($this->data['line_items']))
      return;

    $items = $this->data['line_items'];

    foreach($items as $item):
      if(isset($item['product_id']) && $item['product_id'] == $product_id):
        return isset($item['meta']) ? $item['meta']: false;
      endif;
    endforeach;

    return false;
  }

  /**
   * Payment processing
   * @param $order_id
   * @param $WC_API_Orders
   */
  public function create_order( $order_id, $WC_API_Orders ){

  }

  /**
   * @param $order_id
   */
  public function payment_complete( $order_id ) {

  }


  /**
   * Add any payment messages to API response
   * Also add subtotal_tax to receipt which is not included for some reason
   * @param $order_data
   * @param $order
   * @param $fields
   * @param $server
   * @return
   */
  public function order_response( $order_data, $order, $fields, $server ) {
    return $order_data;
  }

}