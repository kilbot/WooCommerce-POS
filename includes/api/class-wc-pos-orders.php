<?php

/**
 * POS Orders Class
 * duck punches the WC REST API
 *
 * @class    WC_POS_API_Orders
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_API_Orders extends WC_POS_API_Abstract {

  /** @var array Contains the raw order data */
  private $data = array();

  /** @var Hacky fix for WC handling of negative tax  */
  private $tax_total = 0;

  /** @var object Contains a reference to the settings classes */
  private $general_settings;
  private $checkout_settings;

  /**
   * Constructor
   */
  public function __construct() {

    // store raw http data
    $this->data = parent::get_data();

    // init subclasses
    $this->init();

    // order data
    add_filter( 'woocommerce_api_create_order_data', array( $this, 'create_order_data'), 10, 2 );
    add_filter( 'woocommerce_api_edit_order_data', array( $this, 'edit_order_data'), 10, 3 );
    add_action( 'woocommerce_api_create_order', array( $this, 'create_order'), 10, 3 );
    add_action( 'woocommerce_api_edit_order', array( $this, 'edit_order'), 10, 3 );

    // payment
    add_action( 'woocommerce_pos_process_payment', array( $this, 'process_payment' ), 10, 2 );
    add_action( 'woocommerce_payment_complete', array( $this, 'payment_complete' ), 10, 1 );

    // order response
    add_filter( 'woocommerce_api_order_response', array( $this, 'order_response' ), 10, 4 );

    // allow decimals for qty
    if( $this->general_settings->get_data('decimal_qty') ){
      remove_filter('woocommerce_stock_amount', 'intval');
      add_filter( 'woocommerce_stock_amount', 'floatval' );
    }

    // order emails
    add_filter( 'woocommerce_email', array( $this, 'woocommerce_email' ), 99 );
  }

  /**
   * Init the settings classes
   */
  private function init(){
    $this->general_settings = new WC_POS_Admin_Settings_General();
    $this->checkout_settings = new WC_POS_Admin_Settings_Checkout();
  }

  /**
   * Create order data
   *
   * @param $data
   * @param $WC_API_Orders
   * @return array
   */
  public function create_order_data($data, $WC_API_Orders){

    // add filters & actions
    add_filter( 'woocommerce_product_tax_class', array( $this, 'product_tax_class' ), 10, 2 );
    add_filter( 'woocommerce_get_product_from_item', array( $this, 'get_product_from_item' ), 10, 3 );
    add_filter( 'pre_option_woocommerce_tax_based_on', array( $this, 'woocommerce_tax_based_on' ) );
    add_filter( 'woocommerce_find_rates', array( $this, 'find_rates'), 10, 2 );
    add_action( 'woocommerce_order_add_product', array( $this, 'order_add_product'), 10, 5 );
    add_action( 'updated_order_item_meta', array( $this, 'updated_order_item_meta'), 10, 4 );
    add_action( 'added_post_meta', array( $this, 'added_post_meta'), 10, 4 );

    // WC API < 2.4 doesn't support fee with taxable = false
    // change taxable = false to taxable = 'none'
    if( version_compare( WC()->version, '2.4', '<' ) && isset($this->data['fee_lines']) ){
      foreach( $this->data['fee_lines'] as &$fee ){
        if( !$fee['taxable'] ){
          $fee['taxable'] = 'none';
        }
      }
    }

    // WC handling of shipping is FUBAR
    // if order has shipping line, we'll have to calc the tax ourselves
    if( isset($this->data['shipping_lines']) && !empty($this->data['shipping_lines']) ){
      add_action( 'woocommerce_order_add_shipping', array( $this, 'order_add_shipping'), 10, 3 );
      add_filter( 'update_post_metadata', array( $this, 'update_post_metadata'), 10, 5 );
    }

    return $this->data;
  }

  /**
   * Edit order data
   *
   * @param $data
   * @param $order_id
   * @param $WC_API_Orders
   * @return array
   */
  public function edit_order_data($data, $order_id, $WC_API_Orders){
    $this->delete_order_items($order_id);
    return $this->create_order_data($data, $WC_API_Orders);
  }

  /**
   * Change the product tax_class
   * @param $tax_class
   * @param $product
   * @return string
   */
  public function product_tax_class($tax_class, $product){

    $id = isset($product->id) ? $product->id: false;
    $id = isset($product->variation_id) ? $product->variation_id: $id;

    if($id){
      $item = $this->get_line_item($id);
      if( isset( $item['tax_class'] ) ){
        $tax_class = sanitize_text_field( $item['tax_class'] );
      }
    }

    return $tax_class;
  }

  /**
   * Set taxable
   * @param $product
   * @param $item
   * @param $WC_Product
   * @return mixed
   */
  public function get_product_from_item($product, $item, $WC_Product){

    $id = isset($product->id) ? $product->id: false;
    $id = isset($product->variation_id) ? $product->variation_id: $id;

    if($id){
      $data = $this->get_line_item($id);
      if( isset( $data['taxable'] ) ){
        // api has options true/false
        // tax_status has options taxable/shipping/none
        $product->tax_status = $data['taxable'] ? 'taxable' : 'none';
      }
    }

    return $product;

  }

  /**
   * Opportunity to change title and add line_item meta
   * @param $order_id
   * @param $item_id
   * @param $product
   * @param $qty
   * @param $args
   */
  public function order_add_product($order_id, $item_id, $product, $qty, $args){

    $id = isset($product->id) ? $product->id: false;
    $id = isset($product->variation_id) ? $product->variation_id: $id;

    if($id){
      $data = $this->get_line_item($id);

      // update title
      if( isset( $data['title'] ) ){
        wc_update_order_item( $item_id,
          array(
            'order_item_name' => sanitize_text_field( $data['title'] )
          )
        );
      }

      // update meta
      if( isset( $data['meta'] ) && !empty( $data['meta'] ) ){
        $this->add_product_meta( $item_id, $data['meta'] );
      }

    }

  }

  /**
   * Add product meta
   * @param $item_id
   * @param array $meta
   */
  private function add_product_meta($item_id, array $meta){

    // line meta
    foreach($meta as $m) {
      $label = isset($m['label']) ? $m['label'] : '';
      $value = isset($m['value']) ? $m['value'] : '';
      wc_add_order_item_meta( $item_id, $label, $value );
    }

  }

  /**
   *
   * @param $order_id
   * @param $item_id
   * @param $rate
   */
  public function order_add_shipping($order_id, $item_id, $rate){
    $shipping_line = $this->get_shipping_line($rate, $item_id);

    if($shipping_line && isset($shipping_line['tax'])){
      $taxes = array();
      foreach($shipping_line['tax'] as $k => $tax){
        if( !empty($tax) ){
          $taxes[$k] = isset($tax['total']) ? wc_format_decimal( $tax['total'] ) : 0 ;
        }
      }
      wc_update_order_item_meta( $item_id, 'taxes', $taxes );
    }
  }

  /**
   * Short circuit get_option('woocommerce_tax_based_on') as shop base
   * @return string
   */
  public function woocommerce_tax_based_on(){
    return 'base';
  }

  /**
   * Remove calc_shipping_tax
   * @param $matched_tax_rates
   * @param $args
   * @return array
   */
  public function find_rates( $matched_tax_rates, $args ){
    if ( $matched_tax_rates ) {
      foreach ( $matched_tax_rates as &$rate ) {
        $rate['shipping'] = 'no';
      }
    }
    return $matched_tax_rates;
  }

  /**
   * Retrieve line_item from raw data
   * @param $product_id
   */
  private function get_line_item($product_id){
    if(!isset($this->data['line_items']))
      return;

    foreach($this->data['line_items'] as $item){
      if( isset($item['product_id']) && $item['product_id'] == $product_id )
        return $item;
    }
  }

  /**
   * Match $rate properties to raw data
   * - there's no id to match so do best guess match id, title & cost
   * @param $rate
   * @param $item_id
   */
  private function get_shipping_line($rate, $item_id){
    if(!isset($this->data['shipping_lines']))
      return;

    $lines = $this->data['shipping_lines'];
    foreach($lines as $key => &$line){
      if(
        $line['method_id'] == $rate->method_id &&
        $line['method_title'] == $rate->label &&
        $line['total'] == $rate->cost &&
        !isset( $line['id'] )
      )
        $line['id'] = $item_id;
        return $line;
    }
  }

  /**
   * Fix item meta for negative product/fee values
   * @param $meta_id
   * @param $order_id
   * @param $meta_key
   * @param $meta_value
   */
  public function updated_order_item_meta($meta_id, $order_id, $meta_key, $meta_value){

    if($meta_key == '_line_tax_data'){
      $line_subtotal_taxes = isset($meta_value['subtotal']) ? $meta_value['subtotal'] : array();
      $line_taxes          = isset($meta_value['total']) ? $meta_value['total'] : array();
      $line_subtotal_tax   = array_sum( $line_subtotal_taxes );
      $line_tax            = array_sum( $line_taxes );

      // store tax_total for use by $this->added_post_meta
      $this->tax_total     += $line_tax;

      wc_update_order_item_meta( $order_id, '_line_subtotal_tax', wc_format_decimal( $line_subtotal_tax ) );
      wc_update_order_item_meta( $order_id, '_line_tax', wc_format_decimal( $line_tax ) );
    }

  }

  /**
   * Fix post meta for negative product/fee values
   * @param $meta_id
   * @param $order_id
   * @param $meta_key
   * @param $meta_value
   */
  public function added_post_meta($meta_id, $order_id, $meta_key, $meta_value){
    if($meta_key == '_order_tax' && isset($this->tax_total)){
      update_post_meta($order_id, '_order_tax', $this->tax_total);
    }
  }

  /**
   * Apply shipping tax if required
   * -
   * - filter has already passed $this->data['shipping_tax'] test
   * @param $null
   * @param $order_id
   * @param $meta_key
   * @param $meta_value
   * @param $prev_value
   * @return null
   */
  public function update_post_metadata($null, $order_id, $meta_key, $meta_value, $prev_value){

    if( $meta_key != '_order_shipping')
      return $null;

    // we want last update to _order_shipping after $order->calculate_taxes()
    // quick, dirty test for _order_tax
    if( ! get_post_meta( $order_id, '_order_tax', true ) )
      return $null;

    // update order meta
    $shipping_tax_total = isset($this->data['shipping_tax']) ? $this->data['shipping_tax'] : 0 ;
    update_post_meta( $order_id, '_order_shipping_tax', wc_format_decimal( $shipping_tax_total ) );

    // check each shipping tax line
    // if order item meta already exists, update the shipping_tax_amount
    // if order item meta not present, add the new tax
    // ... nasty :(

    // first get an assoc array of $rate_id => $item_id
    $tax_items = array();
    $order = wc_get_order( $order_id );
    foreach ( $order->get_tax_totals() as $code => $tax ) {
      $tax_items[$tax->rate_id] = $tax->id;
    }

    // now loop through the shipping_lines
    foreach($this->data['shipping_lines'] as $shipping) :
      if( $shipping['tax'] ) :
        foreach( $shipping['tax'] as $rate_id => $tax ) :
          if( isset( $tax['total'] ) ) :

            if( array_key_exists( $rate_id, $tax_items ) ){
              wc_update_order_item_meta( $tax_items[$rate_id], 'shipping_tax_amount', wc_format_decimal( $tax['total'] ) );
            } else {
              $order->add_tax( $rate_id, 0, $tax['total'] );
            }

          endif;
        endforeach;
      endif;
    endforeach;

    return $null;
  }

  /**
   * Create order complete
   * @param $order_id
   * @param $data
   * @param $WC_API_Orders
   */
  public function create_order( $order_id, $data, $WC_API_Orders ){
    // pos meta
    update_post_meta( $order_id, '_pos', 1 );
    update_post_meta( $order_id, '_pos_user', get_current_user_id() );

    // payment
    do_action( 'woocommerce_pos_process_payment', $order_id, $data);
  }

  /**
   * Edit order complete
   * @param $order_id
   * @param $data
   * @param $WC_API_Orders
   */
  public function edit_order( $order_id, $data, $WC_API_Orders ){
    // payment
    do_action( 'woocommerce_pos_process_payment', $order_id, $data);
  }

  /**
   * Process payment
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
    $gateways = $this->checkout_settings->load_enabled_gateways();
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
   * Some gateways will check if enabled
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
      $message = __('You are now being redirected offsite to complete the payment.', 'woocommerce-pos');
      $message .= sprintf( __('<a href="%s">Click here</a> if you are not redirected automatically.', 'woocommerce-pos'), $response['redirect'] );
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
      $order->update_status( $this->checkout_settings->get_data('order_status'), $message );
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
    if( version_compare( WC()->version, '2.4', '<' ) &&
      $this->general_settings->get_data('decimal_qty') ){
      $order_data['line_items'] = $this->filter_qty($order_data['line_items']);
    }

    return $order_data;
  }

  /**
   * Adds support for custom address fields
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
  static public function get_ids($updated_at_min){
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
   * Delete all order items
   * @param int $order_id
   */
  private function delete_order_items(int $order_id){
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
    if( !$this->checkout_settings->get_data('customer_emails') ){
      $this->remove_customer_emails($wc_emails);
    }

    if( !$this->checkout_settings->get_data('admin_emails') ){
      $this->remove_admin_emails($wc_emails);
    }
  }

  /**
   * @param WC_Emails $wc_emails
   */
  private function remove_customer_emails(WC_Emails $wc_emails){
    remove_action(
      'woocommerce_order_status_pending_to_processing_notification',
      array(
        $wc_emails->emails['WC_Email_Customer_Processing_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_pending_to_on-hold_notification',
      array(
        $wc_emails->emails['WC_Email_Customer_Processing_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_completed_notification',
      array(
        $wc_emails->emails['WC_Email_Customer_Completed_Order'],
        'trigger'
      )
    );
  }

  /**
   * @param WC_Emails $wc_emails
   */
  private function remove_admin_emails(WC_Emails $wc_emails){
    // send 'woocommerce_low_stock_notification'
    // send 'woocommerce_no_stock_notification'
    // send 'woocommerce_product_on_backorder_notification'
    remove_action(
      'woocommerce_order_status_pending_to_processing_notification',
      array(
        $wc_emails->emails['WC_Email_New_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_pending_to_completed_notification',
      array(
        $wc_emails->emails['WC_Email_New_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_pending_to_on-hold_notification',
      array(
        $wc_emails->emails['WC_Email_New_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_failed_to_processing_notification',
      array(
        $wc_emails->emails['WC_Email_New_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_failed_to_completed_notification',
      array(
        $wc_emails->emails['WC_Email_New_Order'],
        'trigger'
      )
    );
    remove_action(
      'woocommerce_order_status_failed_to_on-hold_notification',
      array(
        $wc_emails->emails['WC_Email_New_Order'],
        'trigger'
      )
    );

  }

}