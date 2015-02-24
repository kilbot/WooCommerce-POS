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

    if(!$_item = $this->get_line_item($product->id, $item_id)){
      return;
    };

    // tax class
    wc_update_order_item_meta( $item_id, '_tax_class', $_item['tax_class'] );


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
   * @param $item_id
   * @return bool|void
   */
  private function get_line_item($product_id, $item_id){
    if(!isset($this->data['line_items']))
      return;

    $items = $this->data['line_items'];

    foreach($items as $k => $item):
      if(isset($item['product_id']) && $item['product_id'] == $product_id):
        $this->data['line_items'][$k]['id'] = $item_id;
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
    $this->update_order_meta($order_id);
    $this->update_line_items($order_id);
  }

  private function update_order_meta( $order_id ){
    update_post_meta( $order_id, '_order_discount', $this->data['order_discount'] );
    update_post_meta( $order_id, '_cart_discount', 	$this->data['cart_discount'] );
    update_post_meta( $order_id, '_order_tax', 			$this->data['total_tax'] );
    update_post_meta( $order_id, '_order_total', 		$this->data['total'] );
  }

  /**
   * @param $order_id
   */
  private function update_line_items( $order_id ){

    if(!isset($this->data['line_items']))
      return;

    foreach($this->data['line_items'] as $item){
      if(!isset($item['id']))
        return;

      $line_taxes = array();
      $line_subtotal_taxes = array();
      foreach($item['tax'] as $key => $itemized){
        $line_taxes[$key] = $itemized['total'];
        $line_subtotal_taxes[$key] = $itemized['subtotal'];

        $code = WC_Tax::get_rate_code( $key );
        $tax_item_id = wc_add_order_item( $order_id, array(
          'order_item_name' => $code,
          'order_item_type' => 'tax'
        ));
        if($tax_item_id) {
          wc_add_order_item_meta( $tax_item_id, 'rate_id', $key );
          wc_add_order_item_meta( $tax_item_id, 'label', $itemized['label'] );
          wc_add_order_item_meta( $tax_item_id, 'compound', ( $itemized['compound'] == 'yes' ? 1 : 0 ) );
          wc_add_order_item_meta( $tax_item_id, 'tax_amount', $itemized['total'] );
          wc_add_order_item_meta( $tax_item_id, 'shipping_tax_amount', 0 );
        }
      }

      wc_update_order_item_meta( $item['id'], '_line_subtotal_tax', $item['subtotal_tax'] );
      wc_update_order_item_meta( $item['id'], '_line_tax', $item['total_tax'] );
      wc_update_order_item_meta( $item['id'], '_line_tax_data', array( 'total' => $line_taxes, 'subtotal' => $line_subtotal_taxes ) );
    }

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