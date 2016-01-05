<?php

/**
 * Provides a Card Payment Gateway.
 *
 * @class       WC_POS_Gateways_Card
 * @package     WooCommerce POS
 * @author      Paul Kilmurray <paul@kilbot.com.au>
 * @link        http://www.woopos.com.au
 * @extends     WC_Payment_Gateway
 */

class WC_POS_Gateways_Card extends WC_Payment_Gateway {

  /**
   * Constructor for the gateway.
   */
  public function __construct() {
    $this->id           = 'pos_card';
    $this->title        = __( 'Card', 'woocommerce-pos' );
    $this->description  = '';
    $this->icon         = apply_filters( 'woocommerce_pos_card_icon', '' );
    $this->has_fields   = true;

    // Actions
    add_action( 'woocommerce_pos_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    add_action( 'woocommerce_thankyou_pos_card', array( $this, 'calculate_cashback' ) );

  }

  /**
   * Display the payment fields in the checkout
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
      <div class="form-row " id="pos-cashback_field">
        <label for="pos-cashback" class="">'. __('Cashback', 'woocommerce-pos') .'</label>
        <div class="input-group">
        '. $left_addon .'
          <input type="text" class="form-control" name="pos-cashback" id="pos-cashback" placeholder="" maxlength="20" data-value="0" data-numpad="cash" data-label="'. __('Cashback', 'woocommerce-pos') .'">
        '. $right_addon .'
        </div>
      </div>
    ';

  }

  /**
   * @param int $order_id
   * @return array
   */
  public function process_payment( $order_id ) {

    // get order object
    $order = new WC_Order( $order_id );

    // update pos_cash data
    $data = WC_POS_API::get_raw_data();
    $cashback = isset( $data['payment_details']['pos-cashback'] ) ? wc_format_decimal( $data['payment_details']['pos-cashback'] ) : 0 ;

    if( $cashback !== 0 ) {

      // add order meta
      update_post_meta( $order_id, '_pos_card_cashback', $cashback );

      // add cashback as fee line item
      // TODO: this should be handled by $order->add_fee after WC 2.2
      $item_id = wc_add_order_item( $order_id, array(
        'order_item_name' => __('Cashback', 'woocommerce-pos'),
        'order_item_type' => 'fee'
      ) );

      if ( $item_id ) {
        wc_add_order_item_meta( $item_id, '_line_total', $cashback );
        wc_add_order_item_meta( $item_id, '_line_tax', 0 );
        wc_add_order_item_meta( $item_id, '_line_subtotal', $cashback );
        wc_add_order_item_meta( $item_id, '_line_subtotal_tax', 0 );
        wc_add_order_item_meta( $item_id, '_tax_class', 'zero-rate' );
      }

      // update the order total to include fee
      $order_total = get_post_meta( $order_id, '_order_total', true );
      $order_total += $cashback;
      update_post_meta( $order_id, '_order_total', $order_total );

    }

    // payment complete
    $order->payment_complete();

    // success
    return array(
      'result' => 'success'
    );
  }

  public function calculate_cashback( $order_id ) {
    $message = '';
    $cashback = get_post_meta( $order_id, '_pos_card_cashback', true );

    // construct message
    if( $cashback ) {
      $message = __('Cashback', 'woocommerce-pos') . ': ';
      $message .= wc_price($cashback);
    }

    echo $message;
  }

}