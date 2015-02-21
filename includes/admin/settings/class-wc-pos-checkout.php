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

  protected function load_gateways() {
    $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    $settings = get_option( WC_POS_Admin_Settings::DB_PREFIX . $this->id );

    if( $settings && isset( $settings['gateway_order'] ) ) {
      $order = $settings['gateway_order'];
    }

    // reorder
    foreach( $gateways as $gateway ) {
      if( isset( $order[$gateway->id] ) ) {
        $ordered_gateways[ $order[$gateway->id] ] = $gateway;
      } else {
        $ordered_gateways[] = $gateway;
      }
      $gateway->pos = false;
      apply_filters( 'woocommerce_pos_payment_gateways', $gateway );
    }

    ksort( $ordered_gateways, SORT_NUMERIC );
    return $ordered_gateways;
  }

  /**
   * Gateway data, eg: title, description, icon
   * defaults to Woo settings
   * @param $gateway_id
   * @return array|bool
   */
  public function get_gateway_data($gateway_id){
    $data = get_option(WC_POS_Admin_Settings::DB_PREFIX . 'gateway_' . $gateway_id);
    return $data ? $data : $this->default_gateway_settings($gateway_id);
  }

  private function default_gateway_settings( $gateway_id ) {
    $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    $settings = false;
    $gateway = null;

    // get gateway by id
    foreach( $gateways as $object ) {
      if ( $gateway_id == $object->id ) {
        $gateway = $object;
        break;
      }
    }

    if( $gateway ) {
      $settings['title'] = $gateway->title;
      $settings['description'] = $gateway->description;
      $settings['icon'] = 'true';
    }

    return $settings;
  }

}