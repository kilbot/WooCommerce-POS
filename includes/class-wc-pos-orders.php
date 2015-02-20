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
    add_action( 'woocommerce_api_create_order', array( $this, 'create_order'), 10, 3 );

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
    $data = json_decode(trim(file_get_contents('php://input')), true);

    // store raw data
    $this->data = $data;

    // scrub properties
    $props = array('status');
    foreach($props as $prop){
      unset($data[$prop]);
    }

    return $data;
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

    if(!$_item = $this->get_line_item($product->id)){
      return;
    };

    // tax class
    wc_update_order_item_meta( $item_id, '_tax_class', $_item['tax_class'] );

//    // tax data
//    $tax_data = array();
//    $tax_data['total']    = array_map( 'wc_format_decimal', $args['totals']['tax'] );
//    $tax_data['subtotal'] = array_map( 'wc_format_decimal', $args['totals']['subtotal_tax'] );
//    wc_add_order_item_meta( $item_id, '_line_tax_data', $tax_data );

    // line meta
    if(isset($_item['meta'])): foreach($_item['meta'] as $meta):
      wc_add_order_item_meta(
        $item_id,
        isset($meta['label']) ? $meta['label'] : '',
        isset($meta['value']) ? $meta['value'] : ''
      );
    endforeach; endif;
  }

  /**
   * Get posted line item data
   * @param $product_id
   * @return bool|void
   */
  private function get_line_item($product_id){
    if(!isset($this->data['line_items']))
      return;

    $items = $this->data['line_items'];

    foreach($items as $item):
      if(isset($item['product_id']) && $item['product_id'] == $product_id):
        return $item;
      endif;
    endforeach;

    return false;
  }

  /**
   * Payment processing
   * @param $order_id
   * @param $data
   * @param $WC_API_Orders
   */
  public function create_order( $order_id, $data, $WC_API_Orders ){

    // patch customer

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