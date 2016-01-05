<?php

/**
 * Provides a Cash Payment Gateway.
 *
 * @class       WC_POS_Gateways_Cash
 * @package     WooCommerce POS
 * @author      Paul Kilmurray <paul@kilbot.com.au>
 * @link        http://www.woopos.com.au
 * @extends     WC_Payment_Gateway
 */

class WC_POS_Gateways_Cash extends WC_Payment_Gateway {

  /**
   * Constructor for the gateway.
   */
  public function __construct() {
    $this->id          = 'pos_cash';
    $this->title       = __( 'Cash', 'woocommerce-pos' );
    $this->description = '';
    $this->icon        = apply_filters( 'woocommerce_pos_cash_icon', '' );
    $this->has_fields  = true;

    // Actions
    add_action( 'woocommerce_pos_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    add_action( 'woocommerce_thankyou_pos_cash', array( $this, 'calculate_change' ) );
  }

  /**
   * Display the payment fields on the checkout modal
   */
  public function payment_fields() {

    if ( $this->description ) {
      echo '<p>' . wp_kses_post( $this->description ) . '</p>';
    }

    $currency_pos = get_option( 'woocommerce_currency_pos' );

    if( $currency_pos == 'left' || 'left_space') {
      $left_addon = '<span class="input-group-addon">'. get_woocommerce_currency_symbol( get_woocommerce_currency() ) .'</span>';
      $right_addon = '';
    } else {
      $left_addon = '';
      $right_addon = '<span class="input-group-addon">'. get_woocommerce_currency_symbol( get_woocommerce_currency() ) .'</span>';
    }


    echo '
      <div class="form-row" id="pos-cash-tendered_field">
        <label for="pos-cash-tendered" class="">'. __('Amount Tendered', 'woocommerce-pos') .'</label>
        <div class="input-group">
        '. $left_addon .'
          <input type="text" class="form-control" name="pos-cash-tendered" id="pos-cash-tendered" maxlength="20" data-numpad="cash" data-label="'. __('Amount Tendered', 'woocommerce-pos') .'" data-placement="bottom" data-value="{{total}}">
        '. $right_addon .'
        </div>
      </div>
    ';

  }

  public function process_payment( $order_id ) {

    // get order object
    $order = new WC_Order( $order_id );

    // update pos_cash data
    $data = WC_POS_API::get_raw_data();
    $tendered = isset( $data['payment_details']['pos-cash-tendered'] ) ? wc_format_decimal( $data['payment_details']['pos-cash-tendered'] ) : 0 ;
    $change = isset( $data['payment_details']['pos-cash-change'] ) ? wc_format_decimal( $data['payment_details']['pos-cash-change'] ) : 0 ;
    update_post_meta( $order_id, '_pos_cash_amount_tendered', $tendered );
    update_post_meta( $order_id, '_pos_cash_change', $change );

    // payment complete
    $order->payment_complete();

    // Return thankyou redirect
    return array(
      'result' => 'success'
    );
  }

  public function calculate_change( $order_id ) {
    $message = '';
    $tendered = get_post_meta( $order_id, '_pos_cash_amount_tendered', true );
    $change = get_post_meta( $order_id, '_pos_cash_change', true );

    // construct message
    if( $tendered && $change ) {
      $message = __('Amount Tendered', 'woocommerce-pos') .': ';
      $message .= wc_price($tendered) .'<br>';
      $message .= _x('Change', 'Money returned from cash sale', 'woocommerce-pos') .': ';
      $message .= wc_price($change);
    }

    echo $message;
  }

  static public function payment_details( $order ) {
    return array(
      'tendered'  => get_post_meta( $order->id, '_pos_cash_amount_tendered', true ),
      'change'    => get_post_meta( $order->id, '_pos_cash_change', true )
    );
  }

}