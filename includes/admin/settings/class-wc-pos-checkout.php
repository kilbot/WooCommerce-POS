<?php

/**
* WP Checkout Settings Class
*
* @class    WC_POS_Admin_Settings_Checkout
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Admin_Settings_Checkout extends WC_POS_Admin_Settings_Abstract {

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'checkout';
    /* translators: woocommerce */
    $this->label = __( 'Checkout', 'woocommerce' );

    $this->default_settings = array(
      'order_status'    => 'wc-completed',
      'default_gateway' => 'pos_cash',
      'enabled'         => array(
        'pos_cash'  => true,
        'pos_card'  => true,
        'paypal'    => true
      )
    );
  }

  public function load_gateways() {
    $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    $order = $this->get_data('gateway_order');

    // reorder
    $i = count($gateways);
    foreach( $gateways as $gateway ) {
      if( isset( $order[$gateway->id] ) ) {
        $ordered_gateways[ $order[$gateway->id] ] = $gateway;
      } else {
        $ordered_gateways[ ++$i ] = $gateway;
      }
      $settings = new WC_POS_Admin_Settings_Gateways($gateway->id);
      $settings->merge_settings($gateway);
      $gateway->pos = apply_filters( 'woocommerce_pos_payment_gateways', $gateway );
    }

    ksort( $ordered_gateways, SORT_NUMERIC );
    return $ordered_gateways;
  }

  public function load_enabled_gateways(){
    $gateways = $this->load_gateways();
    $enabled = $this->get_enabled_gateway_ids();
    $default = $this->get_data('default_gateway');
    $_gateways = array();

    if($gateways): foreach($gateways as $gateway):
      $id = $gateway->id;
      if(in_array($id, $enabled) && $gateway->pos){
        $gateway->default = $id == $default;
        $_gateways[$id] = $gateway;
      }
    endforeach; endif;

    return $_gateways;
  }

  public function get_enabled_gateway_ids(){
    return array_keys($this->get_data('enabled'), true);
  }

}