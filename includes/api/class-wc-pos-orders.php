<?php

/**
 * POS Orders Class
 * duck punches the WC REST API
 * note: editing orders is no currently supported
 *
 *
 * @class    WC_POS_API_Orders
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_API_Orders extends WC_POS_API_Abstract {

  /** @var array Contains the raw order data */
  private $data = array();

  /** @var array Contains the settings data */
  private $settings = array();

  /** @var bool Flag for decimal quantity setting */
  private $allow_decimal_qty = false;
  private $completed_order_status = 'completed';

  /**
   * Constructor
   * @param WC_POS_Gateways $gateways
   */
  public function __construct( WC_POS_Gateways $gateways ) {

    // store raw http data
    $this->data = $this->get_data();

    // gateways class
    $this->gateways = $gateways;

    // settings
    $this->get_settings();

    add_filter( 'woocommerce_api_create_order_data', array( $this, 'order_data'), 10, 2 );
    add_filter( 'woocommerce_api_edit_order_data', array( $this, 'edit_order_data'), 10, 3 );
    add_action( 'woocommerce_order_add_product', array( $this, 'order_add_product'), 10, 5 );
    add_action( 'woocommerce_order_add_shipping', array( $this, 'order_add_shipping'), 10, 3 );
    add_action( 'woocommerce_order_add_fee', array( $this, 'order_add_fee'), 10, 3 );
    add_action( 'woocommerce_api_create_order', array( $this, 'create_order'), 10, 3 );
    add_action( 'woocommerce_api_edit_order', array( $this, 'create_order'), 10, 3 );

    // payment
    add_action( 'woocommerce_pos_process_payment', array( $this, 'process_payment' ), 10, 2 );
    add_action( 'woocommerce_payment_complete', array( $this, 'payment_complete' ), 10, 1 );

    // add payment info to order response
    add_filter( 'woocommerce_api_order_response', array( $this, 'order_response' ), 10, 4 );

    // allow decimals for qty
    if( $this->allow_decimal_qty ){
      remove_filter('woocommerce_stock_amount', 'intval');
      add_filter( 'woocommerce_stock_amount', 'floatval' );
    }

    // order emails
    add_filter( 'woocommerce_email', array( $this, 'woocommerce_email' ), 99 );
  }

  private function get_settings(){
    $settings = array();

    // general settings
    $general = new WC_POS_Admin_Settings_General();
    $settings['general'] = $general->get_data();

    if( isset($settings['general']['decimal_qty']) && $settings['general']['decimal_qty']){
      $this->allow_decimal_qty = true;
    }

    // checkout settings
    $checkout = new WC_POS_Admin_Settings_Checkout();
    $settings['checkout'] = $checkout->get_data();

    if( isset($settings['checkout']['order_status']) ){
      $this->completed_order_status = $settings['checkout']['order_status'];
    }

    $this->settings = $settings;
  }

  /**
   * Store raw data for use by payment gateways
   * @return array data
   */
  public function order_data($data, $WC_API_Orders) {
    return $this->data;
  }

  /**
   * Edit order
   * - delete all order data
   *
   * @param $data
   * @param $order_id
   * @param $WC_API_Orders
   * @return array
   */
  public function edit_order_data($data, $order_id, $WC_API_Orders){
//    $this->delete_order_items($order_id);
    return $this->order_data($data, $WC_API_Orders);
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

    return;
  }

  /**
   * @param $order_id
   * @param $item_id
   * @param $rate
   */
  public function order_add_shipping($order_id, $item_id, $rate){
    $shipping_line = $this->get_shipping_line($rate, $item_id);
    if($shipping_line && isset($shipping_line['tax'])){
      $taxes = array();
      foreach($shipping_line['tax'] as $k => $tax){
        $taxes[$k] = isset($tax['total']) ? $tax['total']: 0 ;
      }
      wc_update_order_item_meta( $item_id, 'taxes', $taxes );
    }
  }

  /**
   * Match $rate properties to raw data
   * @param $rate
   * @param $item_id
   */
  private function get_shipping_line($rate, $item_id){
    if(!isset($this->data['shipping_lines']))
      return;

    $lines = $this->data['shipping_lines'];

    foreach($lines as $k => $line):
      if(
        $line['method_id'] == $rate->method_id &&
        $line['method_title'] == $rate->label &&
        $line['total'] == $rate->cost
      ):
        $this->data['shipping_lines'][$k]['id'] = $item_id;
        return $line;
      endif;
    endforeach;

    return;
  }

  /**
   * @param $order_id
   * @param $item_id
   * @param $fee
   */
  public function order_add_fee($order_id, $item_id, $fee){
    if(!isset($this->data['fee_lines']))
      return;

    $lines = $this->data['fee_lines'];

    foreach($lines as $k => $line):
      if(
        $line['title'] == $fee->name &&
        $line['total'] == $fee->amount &&
        $line['tax_class'] == $fee->tax_class
      ):
        $this->data['fee_lines'][$k]['id'] = $item_id;
      endif;
    endforeach;
  }

  /**
   * Payment processing
   * @param $order_id
   * @param $data
   * @param $WC_API_Orders
   */
  public function create_order( $order_id, $data, $WC_API_Orders ){
    $this->update_order_meta($order_id);
    $this->update_lines($order_id, 'line_items');
    $this->update_lines($order_id, 'fee_lines');
    do_action( 'woocommerce_pos_process_payment', $order_id, $data);
  }

  /**
   * @param $order_id
   */
  private function update_order_meta( $order_id ){
    update_post_meta( $order_id, '_order_discount',     $this->data['order_discount'] );
    update_post_meta( $order_id, '_cart_discount',      $this->data['cart_discount'] );
    update_post_meta( $order_id, '_order_shipping_tax', $this->data['shipping_tax'] );
    update_post_meta( $order_id, '_order_tax',          $this->data['total_tax'] - $this->data['shipping_tax'] );
    update_post_meta( $order_id, '_order_total',        $this->data['total'] );

    foreach($this->data['tax_lines'] as $tax){
      $code = WC_Tax::get_rate_code( $tax['rate_id'] );
      $tax_item_id = wc_add_order_item( $order_id, array(
        'order_item_name' => $code,
        'order_item_type' => 'tax'
      ));
      if($tax_item_id) {
        wc_add_order_item_meta( $tax_item_id, 'rate_id', $tax['rate_id'] );
        wc_add_order_item_meta( $tax_item_id, 'label', $tax['label'] );
        wc_add_order_item_meta( $tax_item_id, 'compound', ( $tax['compound'] == 'yes' ? 1 : 0 ) );
        wc_add_order_item_meta( $tax_item_id, 'tax_amount', $tax['total'] - $tax['shipping'] );
        wc_add_order_item_meta( $tax_item_id, 'shipping_tax_amount', $tax['shipping'] );
      }
    }

    // pos meta
    update_post_meta( $order_id, '_pos', 1 );
    update_post_meta( $order_id, '_pos_user', get_current_user_id() );
  }

  /**
   * @param $order_id
   * @param $line
   */
  private function update_lines( $order_id, $line ){

    if(!isset($this->data[$line]))
      return;

    foreach($this->data[$line] as $item){
      if(!isset($item['id']))
        return;

      if(isset($item['tax'])){
        $this->update_line_tax_data($item['id'], $item['tax']);
      }

      $subtotal_tax = isset($item['subtotal_tax']) ? $item['subtotal_tax'] : 0;
      $total_tax = isset($item['total_tax']) ? $item['total_tax'] : 0;

      wc_update_order_item_meta( $item['id'], '_line_subtotal_tax', $subtotal_tax );
      wc_update_order_item_meta( $item['id'], '_line_tax', $total_tax );
    }

  }

  /**
   * @param $item_id
   * @param $line_tax
   */
  private function update_line_tax_data($item_id, $line_tax){
    if(!is_numeric($item_id) || !is_array($line_tax))
      return;

    $line_taxes = array();
    $line_subtotal_taxes = array();
    foreach($line_tax as $key => $itemized){
      $line_taxes[$key] = isset($itemized['total']) ? $itemized['total']: 0 ;
      $line_subtotal_taxes[$key] = isset($itemized['subtotal']) ? $itemized['subtotal'] : 0 ;
    }

    wc_update_order_item_meta( $item_id, '_line_tax_data', array( 'total' => $line_taxes, 'subtotal' => $line_subtotal_taxes ) );
  }

  /**
   * @param $order_id
   * @param $data
   */
  public function process_payment( $order_id, $data ){

    if(!isset($data['payment_details'])){
      return;
    }

    // some gateways check if a user is signed in, so let's switch to customer
    $logged_in_user = get_current_user_id();
    wp_set_current_user( $data['customer_id'] );

    // load the gateways & process payment
    $gateway_id = $data['payment_details']['method_id'];
    add_filter('option_woocommerce_'. $gateway_id .'_settings', array($this, 'force_enable_gateway'));
    $gateways = $this->gateways->enabled_gateways();
    $response = $gateways[ $gateway_id ]->process_payment( $order_id );

    if(isset($response['result']) && $response['result'] == 'success'){
      $this->payment_success($gateway_id, $order_id, $response);
    } else {
      $this->payment_failure($gateway_id, $order_id, $response);
    }

    // switch back to logged in user
    wp_set_current_user( $logged_in_user );

  }

  /**
   * @param $data
   * @return mixed
   */
  public function force_enable_gateway($data){
    if(isset($data['enabled'])){
      $data['enabled'] = 'yes';
    }
    return $data;
  }

  /**
   * @param $gateway_id
   * @param $order_id
   * @param $response
   */
  private function payment_success($gateway_id, $order_id, $response){

    // capture any instructions
    ob_start();
    do_action( 'woocommerce_thankyou_' . $gateway_id, $order_id );
    $response['messages'] = ob_get_contents();
    ob_end_clean();

    // redirect
    if( isset($response['redirect']) ){
      $response['messages'] = $this->payment_redirect($gateway_id, $order_id, $response);
    }

    update_post_meta( $order_id, '_pos_payment_result', 'success' );
    update_post_meta( $order_id, '_pos_payment_message', $response['messages'] );
  }

  /**
   * @param $gateway_id
   * @param $order_id
   * @param $response
   */
  private function payment_failure($gateway_id, $order_id, $response){
    $message = isset($response['messages']) ? $response['messages'] : wc_get_notices( 'error' );

    // if messages empty give generic response
    if(empty($message)){
      $message = __( 'There was an error processing the payment', 'woocommerce-pos');
    }

    update_post_meta( $order_id, '_pos_payment_result', 'failure' );
    update_post_meta( $order_id, '_pos_payment_message', $message );
  }

  /**
   * @param $gateway_id
   * @param $order_id
   * @param $response
   * @return string
   */
  private function payment_redirect($gateway_id, $order_id, $response){
    $message = $response['messages'];

    // compare url fragments
    $success_url = wc_get_endpoint_url( 'order-received', $order_id, get_permalink( wc_get_page_id( 'checkout' ) ) );
    $success_frag = parse_url( $success_url );
    $redirect_frag = parse_url( $response['redirect'] );

    $offsite = $success_frag['host'] !== $redirect_frag['host'];
    $reload = !$offsite && $success_frag['path'] !== $redirect_frag['path'] && $response['messages'] == '';

    if($offsite || $reload){
      update_post_meta( $order_id, '_pos_payment_redirect', $response['redirect'] );
      $message = sprintf( __('You are now being redirected offsite to complete the payment.<br><a target="_blank" href="%s">Click here</a> if you are not redirected automatically.', 'woocommerce-pos'), $response['redirect'] );
    }

    return $message;
  }

  /**
   * @param $order_id
   */
  public function payment_complete( $order_id ) {

    // update order status
    $order = new WC_Order( $order_id );
    if( $order->status == 'processing' ) {
      $message = __('POS Transaction completed.', 'woocommerce-pos');
      $order->update_status( $this->completed_order_status, $message );
    }

  }

  /**
   * Add any payment messages to API response
   * Also add subtotal_tax to receipt which is not included for some reason
   * @param array $order_data
   * @param $order
   * @param $fields
   * @param $server
   * @return array
   */
  public function order_response( $order_data, $order, $fields, $server ) {

    // add pos payment info
    $order_data['payment_details']['result']   = get_post_meta( $order->id, '_pos_payment_result', true );
    $order_data['payment_details']['message']  = get_post_meta( $order->id, '_pos_payment_message', true );
    $order_data['payment_details']['redirect'] = get_post_meta( $order->id, '_pos_payment_redirect', true );

    // addresses
    $order_data['billing_address'] = $this->filter_address($order_data['billing_address'], $order);
    $order_data['shipping_address'] = $this->filter_address($order_data['shipping_address'], $order, 'shipping');

    // allow decimal quantity
    // fixed in WC 2.4+
    if( version_compare( WC()->version, '2.4' ) <= 0 && $this->allow_decimal_qty ){
      $order_data['line_items'] = $this->filter_qty($order_data['line_items']);
    }

    return $order_data;
  }

  /**
   * @param $address
   * @param $order
   * @param string $type
   * @return array
   */
  private function filter_address( $address, $order, $type = 'billing' ){
    $fields = apply_filters('woocommerce_admin_'.$type.'_fields', false);
    if($fields){
      $address = array();
      foreach($fields as $key => $value){
        $address[$key] = $order->{$type.'_'.$key};
      }
    }
    return $address;
  }

  /**
   * @param $line_items
   * @return mixed
   */
  private function filter_qty($line_items){
    foreach( $line_items as &$item ){
      $qty = wc_get_order_item_meta( $item['id'], '_qty' );
      $item['quantity'] = wc_stock_amount( $qty );
    }
    return $line_items;
  }

  /**
   * Returns array of all order ids
   * optionally return ids updated_at_min
   * @param $updated_at_min
   * @return array
   */
  public function get_ids($updated_at_min){
    $args = array(
      'post_type'     => array('shop_order'),
      'post_status'   => array('any'),
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

  /**
   * @param $order_id
   */
  private function delete_order_items($order_id){
    global $wpdb;
    $order_item_ids = $wpdb->get_col( $wpdb->prepare( "
			SELECT      order_item_id
			FROM        {$wpdb->prefix}woocommerce_order_items
			WHERE       order_id = %d
		", $order_id ) );

    foreach($order_item_ids as $item_id){
      wc_delete_order_item($item_id);
    }
  }

  /**
   * WC email notifications
   * @param WC_Emails $wc_emails
   */
  public function woocommerce_email(WC_Emails $wc_emails) {
    if(
      !isset($settings['checkout']) ||
      !isset($settings['checkout']['customer_emails']) ||
      !$settings['checkout']['customer_emails']
    ){
      $this->remove_customer_emails($wc_emails);
    }

    if(
      !isset($settings['checkout']) ||
      !isset($settings['checkout']['admin_emails']) ||
      !$settings['checkout']['admin_emails']
    ){
      $this->remove_admin_emails($wc_emails);
    }
  }

  /**
   * @param WC_Emails $wc_emails
   */
  private function remove_customer_emails(WC_Emails $wc_emails){
    remove_action('woocommerce_order_status_pending_to_processing_notification', array($wc_emails->emails['WC_Email_Customer_Processing_Order'], 'trigger'));
    remove_action('woocommerce_order_status_pending_to_on-hold_notification', array($wc_emails->emails['WC_Email_Customer_Processing_Order'], 'trigger'));
    remove_action('woocommerce_order_status_completed_notification', array($wc_emails->emails['WC_Email_Customer_Completed_Order'], 'trigger'));
  }

  /**
   * @param WC_Emails $wc_emails
   */
  private function remove_admin_emails(WC_Emails $wc_emails){
    // send 'woocommerce_low_stock_notification'
    // send 'woocommerce_no_stock_notification'
    // send 'woocommerce_product_on_backorder_notification'
    remove_action('woocommerce_order_status_pending_to_processing_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
    remove_action('woocommerce_order_status_pending_to_completed_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
    remove_action('woocommerce_order_status_pending_to_on-hold_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
    remove_action('woocommerce_order_status_failed_to_processing_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
    remove_action('woocommerce_order_status_failed_to_completed_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));
    remove_action('woocommerce_order_status_failed_to_on-hold_notification', array($wc_emails->emails['WC_Email_New_Order'], 'trigger'));

  }

}