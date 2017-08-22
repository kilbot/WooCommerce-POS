<?php

/**
 * POS Orders Class
 * duck punches the WC REST API
 *
 * @class    \WC_POS\API\Orders
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\API;

class Orders {

  /**
   * Constructor
   */
  public function __construct() {
    $this->register_additional_fields();

    add_filter( 'woocommerce_rest_pre_insert_shop_order_object', array( $this, 'pre_insert_shop_order_object' ), 10, 3 );
    add_action( 'woocommerce_rest_set_order_item', array( $this, 'rest_set_order_item' ), 10, 2 );
  }


  /**
   * Additional fields for POS
   */
  public function register_additional_fields() {

    // add cashier field
    register_rest_field( 'shop_order',
      'cashier',
      array(
        'get_callback'    => array( $this , 'get_cashier' ),
        'update_callback' => array( $this , 'update_cashier' ),
        'schema'          => null,
      )
    );

    // add payment_details field
    register_rest_field( 'shop_order',
      'payment_details',
      array(
        'get_callback'    => array( $this , 'get_payment_details' ),
        'update_callback' => array( $this , 'update_payment_details' ),
        'schema'          => null,
      )
    );

  }


  /**
   * Retrieve cashier info for the API response
   *
   * @param $response
   * @return mixed|void
   */
  public function get_cashier( $response ) {
    $id = $response['id'];

    if ( !$cashier_id = get_post_meta( $id, '_pos_user', true ) ) {
      return;
    }

    $first_name = get_post_meta( $id, '_pos_user_first_name', true );
    $last_name = get_post_meta( $id, '_pos_user_last_name', true );
    if ( !$first_name && !$last_name && $user_info = get_userdata( $cashier_id ) ) {
      $first_name = $user_info->first_name;
      $last_name = $user_info->last_name;
    }

    $cashier = array(
      'id'         => $cashier_id,
      'first_name' => $first_name,
      'last_name'  => $last_name
    );

    return apply_filters( 'woocommerce_pos_order_response_cashier', $cashier, $response );
  }


  /**
   * Store POS and cashier data
   *
   * @param $cashier From the POS request body
   * @param $order
   */
  public function update_cashier( $cashier, $order ) {
    $id = $order->get_id();
    $current_user = wp_get_current_user();
    update_post_meta( $id, '_pos', 1 );
    update_post_meta( $id, '_pos_user', $current_user->ID );
    update_post_meta( $id, '_pos_user_name', $current_user->user_firstname . ' ' . $current_user->user_lastname );
  }


  /**
   * Retrieve payment info for the API response
   *
   * @param $response
   * @return mixed|void
   */
  public function get_payment_details( $response ) {
    $payment = array();

    return apply_filters( 'woocommerce_pos_order_response_payment_details', $payment, $response );
  }


  /**
   * Process payment and store result
   *
   * @param $payment_details From the POS request body
   * @param $order
   */
  public function update_payment_details( $payment_details, $order ) {

    // payment method
    $payment_method = $order->get_payment_method();

    // some gateways check if a user is signed in, so let's switch to customer
    $logged_in_user = get_current_user_id();
    $customer_id = $order->get_customer_id();
    wp_set_current_user( $customer_id );

    // load the gateways & process payment
    add_filter('option_woocommerce_'. $payment_method .'_settings', array($this, 'force_enable_gateway'));
    $settings = \WC_POS\Admin\Settings\Checkout::get_instance();
    $gateways = $settings->load_enabled_gateways();

    // process payment
    do_action( 'woocommerce_pos_process_payment', $payment_details, $order);
    $response = $gateways[ $payment_method ]->process_payment( $order->get_id() );

    if(isset($response['result']) && $response['result'] == 'success'){

      $this->payment_success($payment_method, $order, $response);

      if( ! get_post_meta( $order->get_id(), '_pos_payment_redirect' ) ) {
        $order->set_date_paid( current_time( 'timestamp', true ) );
        $order->set_date_completed( current_time( 'timestamp', true ) );
        $message = __('POS Transaction completed.', 'woocommerce-pos');
        $order->update_status( wc_pos_get_option( 'checkout', 'order_status' ), $message );
      }

    } else {

      $this->payment_failure($payment_method, $order, $response);
      $order->update_status( 'wc-failed', __( 'There was an error processing the payment', 'woocommerce-pos') );

    }

    // switch back to logged in user
    wp_set_current_user( $logged_in_user );

    // clear any payment gateway messages
    wc_clear_notices();
  }


  /**
   * @param WC_Data         $order
   * @param WP_REST_Request $request
   * @param bool            $creating
   * @return WC_Data
   */
  public function pre_insert_shop_order_object( $order, $request, $creating ) {

    if($creating) {
      // add _pos = 1 postmeta
      $order->update_meta_data( '_pos', 1 );
    }

    // add payment details
    if( isset($request['payment_details']) ) {
      $payment_details = $request['payment_details'];
      $order->set_payment_method( isset($payment_details['method_id']) ? $payment_details['method_id'] : '' );
      $order->set_payment_method_title( isset($payment_details['method_title']) ? $payment_details['method_title'] : '' );
    }

    //
    add_filter( 'wc_tax_enabled', '__return_false' );
    $order->save();
    $order->update_taxes();
    $order->calculate_totals();

    return $order;
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
   * @param $order
   * @param $response
   */
  private function payment_success($gateway_id, $order, $response){

    // capture any instructions
    ob_start();
    do_action( 'woocommerce_thankyou_' . $gateway_id, $order->get_id() );
    $response['messages'] = ob_get_contents();
    ob_end_clean();

    // redirect
    if( isset($response['redirect']) ){
      $response['messages'] = $this->payment_redirect($gateway_id, $order, $response);
    }

    update_post_meta( $order->get_id(), '_pos_payment_result', 'success' );
    update_post_meta( $order->get_id(), '_pos_payment_message', $response['messages'] );
  }


  /**
   * @param $gateway_id
   * @param $order
   * @param $response
   */
  private function payment_failure($gateway_id, $order, $response){
    $response['messages'] = isset($response['messages']) ? $response['messages'] : wc_get_notices( 'error' );

    // if messages empty give generic response
    if(empty($response['messages'])){
      $response['messages'] = __( 'There was an error processing the payment', 'woocommerce-pos');
    }

    update_post_meta( $order->get_id(), '_pos_payment_result', 'failure' );
    update_post_meta( $order->get_id(), '_pos_payment_message', $response['messages'] );
  }

  /**
   * @param $gateway_id
   * @param $order
   * @param $response
   * @return string
   */
  private function payment_redirect($gateway_id, $order, $response){
    $message = $response['messages'];

    // compare url fragments
    $success_url = wc_get_endpoint_url( 'order-received', $order->get_id(), get_permalink( wc_get_page_id( 'checkout' ) ) );
    $success = wp_parse_args( parse_url( $success_url ), array( 'host' => '', 'path' => '' ));
    $redirect = wp_parse_args( parse_url( $response['redirect'] ), array( 'host' => '', 'path' => '' ));

    $offsite = $success['path'] !== $redirect['path'] && $response['messages'] == '';

    if($offsite){
      update_post_meta( $order->get_id(), '_pos_payment_redirect', $response['redirect'] );
      $message = __('You are now being redirected offsite to complete the payment. ', 'woocommerce-pos');
      $message .= sprintf( __('<a href="%s">Click here</a> if you are not redirected automatically. ', 'woocommerce-pos'), $response['redirect'] );
    }

    return $message;
  }


  /**
   * @param $item
   * @param $posted
   */
  public function rest_set_order_item( $item, $posted ) {

    if( isset($posted['tax_status']) && $posted['tax_status'] == 'taxable' ) {
      $total = array();
      $subtotal = array();

      if(isset($posted['taxes']) && is_array($posted['taxes'])): foreach($posted['taxes'] as $tax):
        if(is_array($tax) && isset($tax['rate_id'])) {
          $total[$tax['rate_id']] = isset($tax['total']) ? $tax['total'] : 0;
          $subtotal[$tax['rate_id']] = isset($tax['subtotal']) ? $tax['subtotal'] : 0;
        }
      endforeach; endif;

      if( get_class($item) == 'WC_Order_Item_Product' ) {
        $item->set_taxes( array( 'total' => $total, 'subtotal' => $subtotal ) );
      } else {
        $item->set_taxes( array( 'total' => $total ) );
      }
    }

  }


  /**
   * Returns array of all order ids
   * optionally return ids updated_at_min
   * @param $date_modified
   * @return array
   */
  public function get_ids($date_modified){
    $args = array(
      'post_type'     => array('shop_order'),
      'post_status'   => array('any'),
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