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
  private $flag = false;

  /**
   * Constructor
   */
  public function __construct() {

    // order data
    add_filter( 'woocommerce_api_create_order_data', array( $this, 'create_order_data') );
    add_filter( 'woocommerce_api_edit_order_data', array( $this, 'edit_order_data'), 10, 2 );
    add_action( 'woocommerce_api_create_order', array( $this, 'create_order') );
    add_action( 'woocommerce_api_edit_order', array( $this, 'edit_order') );

    // payment
    add_action( 'woocommerce_pos_process_payment', array( $this, 'process_payment' ), 10, 2 );
    add_action( 'woocommerce_payment_complete', array( $this, 'payment_complete' ), 10, 1 );

    // order response
    add_filter( 'woocommerce_api_order_response', array( $this, 'order_response' ), 10, 4 );

    // order emails
    add_filter( 'woocommerce_email', array( $this, 'woocommerce_email' ), 99 );
  }

  /**
   * Create order data
   *
   * @param array $data
   * @return array
   */
  public function create_order_data(array $data){

    // store raw http data
    $this->data = $data;

    // add filters & actions for create order
    add_filter( 'woocommerce_product_tax_class', array( $this, 'product_tax_class' ), 10, 2 );
    add_filter( 'woocommerce_get_product_from_item', array( $this, 'get_product_from_item' ), 10, 3 );
    add_filter( 'pre_option_woocommerce_tax_based_on', array( $this, 'woocommerce_tax_based_on' ) );
    add_filter( 'woocommerce_find_rates', array( $this, 'find_rates'), 10, 2 );
    add_action( 'woocommerce_order_add_product', array( $this, 'order_add_product'), 10, 5 );
    add_action( 'updated_order_item_meta', array( $this, 'updated_order_item_meta'), 10, 4 );

    // WC API < 2.4 has a bug if $fee['taxable'] = false
    // set $fee['taxable'] = true and use random tax_class so not tax is calculated
    if( version_compare( WC()->version, '2.4', '<' ) && isset($this->data['fee_lines']) ){
      foreach( $this->data['fee_lines'] as &$fee ){
        if( !isset($fee['taxable']) || $fee['taxable'] == false ){
          $fee['taxable'] = true;
          $fee['tax_class'] = 'upgrade-woocommerce-' . time();
        }
      }
    }

    // WC handling of shipping is FUBAR
    // if order has shipping line, we'll have to calc the tax ourselves
    // also recalc total tax for negative fee lines
    $has_fee = isset($this->data['fee_lines']) && !empty($this->data['fee_lines']);
    $has_shipping = isset($this->data['shipping_lines']) && !empty($this->data['shipping_lines']);

    if( $has_shipping )
      add_action( 'woocommerce_order_add_shipping', array( $this, 'order_add_shipping'), 10, 3 );

    if( $has_fee || $has_shipping )
      add_filter( 'update_post_metadata', array( $this, 'update_post_metadata'), 10, 5 );

    // populate customer data
    $customer_id = isset( $data['customer_id'] ) ? $data['customer_id'] : 0 ;
    if($customer_id){
      $this->data['billing_address'] = $this->get_customer_details($customer_id, 'billing');
      $this->data['shipping_address'] = $this->get_customer_details($customer_id, 'shipping');
    }

    return $this->data;
  }

  /**
   * Edit order data
   *
   * @param $data
   * @param $order_id
   * @return array
   */
  public function edit_order_data(array $data, $order_id){
//    $this->delete_order_items($order_id);
    return $this->create_order_data($data);
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

      wc_update_order_item_meta( $order_id, '_line_subtotal_tax', wc_format_decimal( $line_subtotal_tax ) );
      wc_update_order_item_meta( $order_id, '_line_tax', wc_format_decimal( $line_tax ) );
    }

  }

  /**
   * Apply shipping tax, fix order_tax
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

    // we want last update to _order_shipping after $order->calculate_taxes()
    // set flag true on first pass
    if( $meta_key == '_order_shipping_tax' )
      $this->flag = true;

    if( $meta_key != '_order_shipping' || ! $this->flag )
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
    $order_tax = 0;
    $order = wc_get_order( $order_id );
    foreach ( $order->get_tax_totals() as $code => $tax ) {
      $tax_items[$tax->rate_id] = $tax->id;
      $order_tax += $tax->amount;
    }

    // fix total_tax calc
    update_post_meta($order_id, '_order_tax', $order_tax);

    // now loop through the shipping_lines
    if( isset( $shipping['shipping_lines'] ) ) :
      foreach($this->data['shipping_lines'] as $shipping) :
        if( isset( $shipping['tax'] ) ) :
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
    endif;

    return $null;
  }

  /**
   * Create order complete
   * @param $order_id
   */
  public function create_order( $order_id ){
    // pos meta
    global $current_user;
    get_currentuserinfo();
    update_post_meta( $order_id, '_pos', 1 );
    update_post_meta( $order_id, '_pos_user', $current_user->ID );
    update_post_meta( $order_id, '_pos_user_name', $current_user->user_firstname . ' ' . $current_user->user_lastname );

    // payment
    do_action( 'woocommerce_pos_process_payment', $order_id, $this->data);
  }

  /**
   * Edit order complete
   * @param $order_id
   */
  public function edit_order( $order_id ){
    // payment
    do_action( 'woocommerce_pos_process_payment', $order_id, $this->data);
  }

  /**
   * Process payment
   * @param $order_id
   * @param $data
   */
  public function process_payment( $order_id, $data ){

    if( !isset($data['payment_details']) ){
      return;
    }

    // special case, pos_card cashback
    if(isset($data['payment_details']['pos-cashback'])){
      $_POST['pos-cashback'] = $data['payment_details']['pos-cashback'];
    }

    // some gateways check if a user is signed in, so let's switch to customer
    $logged_in_user = get_current_user_id();
    $customer_id = isset( $data['customer_id'] ) ? $data['customer_id'] : 0 ;
    wp_set_current_user( $customer_id );

    // load the gateways & process payment
    $gateway_id = $data['payment_details']['method_id'];
    add_filter('option_woocommerce_'. $gateway_id .'_settings', array($this, 'force_enable_gateway'));
    $settings = WC_POS_Admin_Settings_Checkout::get_instance();
    $gateways = $settings->load_enabled_gateways();
    $response = $gateways[ $gateway_id ]->process_payment( $order_id );

    if(isset($response['result']) && $response['result'] == 'success'){
      $this->payment_success($gateway_id, $order_id, $response);
    } else {
      $this->payment_failure($gateway_id, $order_id, $response);
    }

    // switch back to logged in user
    wp_set_current_user( $logged_in_user );

    // clear any payment gateway messages
    wc_clear_notices();
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
    $success = wp_parse_args( parse_url( $success_url ), array( 'host' => '', 'path' => '' ));
    $redirect = wp_parse_args( parse_url( $response['redirect'] ), array( 'host' => '', 'path' => '' ));

    $offsite = $success['host'] !== $redirect['host'];
    $reload = !$offsite && $success['path'] !== $redirect['path'] && $response['messages'] == '';

    if($offsite || $reload){
      update_post_meta( $order_id, '_pos_payment_redirect', $response['redirect'] );
      $message = __('You are now being redirected offsite to complete the payment. ', 'woocommerce-pos');
      $message .= sprintf( __('<a href="%s">Click here</a> if you are not redirected automatically. ', 'woocommerce-pos'), $response['redirect'] );
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
      $order->update_status( wc_pos_get_option( 'checkout', 'order_status' ), $message );
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

    // add cashier data
    $cashier_details = isset( $order_data['cashier'] ) ? $order_data['cashier'] : array();
    $order_data['cashier'] = $this->add_cashier_details( $order, $cashier_details );

    // add pos payment info
    $payment_details = isset( $order_data['payment_details'] ) ? $order_data['payment_details'] : array();
    $order_data['payment_details'] = $this->add_payment_details( $order, $payment_details );

    // addresses
//    $order_data['billing_address'] = $this->filter_address($order_data['billing_address'], $order);
//    $order_data['shipping_address'] = $this->filter_address($order_data['shipping_address'], $order, 'shipping');

    // allow decimal quantity
    // fixed in WC 2.4+
    if( version_compare( WC()->version, '2.4', '<' ) && wc_pos_get_option( 'general', 'decimal_qty' ) ){
      $order_data['line_items'] = $this->filter_qty($order_data['line_items']);
    }

    // add subtotal_tax
    $subtotal_tax = 0;
    foreach( $order_data['line_items'] as $item ) {
      if(isset( $item['subtotal_tax'] )) {
        $subtotal_tax += wc_format_decimal( $item['subtotal_tax'] );
      }
    }
    $order_data['subtotal_tax'] = wc_format_decimal( $subtotal_tax );

    // add shipping tax
    foreach( $order_data['shipping_lines'] as &$item ) {
      if(isset( $item['id'] )) {
        $taxes = wc_get_order_item_meta( $item['id'], 'taxes' );
        $item['total_tax'] = wc_format_decimal( array_sum($taxes) );
      }
    }

    // add cart discount tax
    $order_data['cart_discount_tax'] = get_post_meta($order->id, '_cart_discount_tax', true);

    return $order_data;
  }

  /**
   * @param $order
   * @param array $cashier
   * @return array
   */
  private function add_cashier_details( $order, array $cashier = array() ){
    $cashier['id'] = get_post_meta( $order->id, '_pos_user', true);
    $first_name = get_post_meta( $order->id, '_pos_user_first_name', true);
    $last_name = get_post_meta( $order->id, '_pos_user_last_name', true);
    if( !$first_name && !$last_name ) {
      $user_info = get_userdata( $cashier['id'] );
      $first_name = $user_info->first_name;
      $last_name = $user_info->last_name;
    }
    $cashier['first_name'] = $first_name;
    $cashier['last_name'] = $last_name;
    return apply_filters( 'woocommerce_pos_order_response_cashier', $cashier, $order );
  }

  /**
   * @param $order
   * @param array $payment
   * @return array
   */
  private function add_payment_details( $order, array $payment = array() ){
    $payment['result']   = get_post_meta( $order->id, '_pos_payment_result', true );
    $payment['message']  = get_post_meta( $order->id, '_pos_payment_message', true );
    $payment['redirect'] = get_post_meta( $order->id, '_pos_payment_redirect', true );
    if( isset( $payment['method_id'] ) && $payment['method_id'] == 'pos_cash' ){
      $payment = WC_POS_Gateways_Cash::payment_details( $payment, $order );
    }
    return apply_filters( 'woocommerce_pos_order_response_payment_details', $payment, $order );
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
    if( $fields ){
      $address = array();
      foreach($fields as $key => $value){
        $address[$key] = $order->{$type.'_'.$key};
      }
    }
    return $address;
  }

  /**
   * Get customer details
   * - mirrors woocommerce/includes/class-wc-ajax.php->get_customer_details()
   * @param $user_id
   * @param $type_to_load
   * @return mixed|void
   */
  private function get_customer_details( $user_id, $type_to_load ){
    $customer_data = array(
      $type_to_load . '_first_name' => get_user_meta( $user_id, $type_to_load . '_first_name', true ),
      $type_to_load . '_last_name'  => get_user_meta( $user_id, $type_to_load . '_last_name', true ),
      $type_to_load . '_company'    => get_user_meta( $user_id, $type_to_load . '_company', true ),
      $type_to_load . '_address_1'  => get_user_meta( $user_id, $type_to_load . '_address_1', true ),
      $type_to_load . '_address_2'  => get_user_meta( $user_id, $type_to_load . '_address_2', true ),
      $type_to_load . '_city'       => get_user_meta( $user_id, $type_to_load . '_city', true ),
      $type_to_load . '_postcode'   => get_user_meta( $user_id, $type_to_load . '_postcode', true ),
      $type_to_load . '_country'    => get_user_meta( $user_id, $type_to_load . '_country', true ),
      $type_to_load . '_state'      => get_user_meta( $user_id, $type_to_load . '_state', true ),
      $type_to_load . '_email'      => get_user_meta( $user_id, $type_to_load . '_email', true ),
      $type_to_load . '_phone'      => get_user_meta( $user_id, $type_to_load . '_phone', true ),
    );
    $customer_data = apply_filters( 'woocommerce_found_customer_details', $customer_data, $user_id, $type_to_load );

    // remove billing_ or shipping_ prefix for WC REST API
    $data = array();
    foreach( $customer_data as $key => $value ): if($value):
      $key = str_replace( $type_to_load.'_', '', $key );
      $data[$key] = $value;
    endif; endforeach;
    return $data;
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

    if( ! wc_pos_get_option( 'checkout', 'customer_emails' ) ){
      $this->remove_customer_emails($wc_emails);
    }

    if( ! wc_pos_get_option( 'checkout', 'admin_emails' ) ){
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