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

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'checkout';
    /* translators: woocommerce */
    $this->label = __( 'Checkout', 'woocommerce' );

    $this->defaults = array(
      'order_status'    => 'wc-completed',
      'default_gateway' => 'pos_cash',
      'enabled' => array(
        'pos_cash'  => true,
        'pos_card'  => true,
        'paypal'    => true
      )
    );
  }

  public function load_gateways() {
    $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    $order = $this->get('gateway_order');
    
    // some poorly written plugins will init WC_Payment_Gateways before WP init
    // check to see if POS Cash Gateway is present, if not: re-init WC_Payment_Gateways
    if( ! in_array( 'WC_POS_Gateways_Cash', array_map( 'get_class', $gateways ) ) ){
      WC_Payment_Gateways::instance()->init();
      $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    }

    // some poorly written plugins will init WC_Payment_Gateways before WP init
    // check to see if POS Cash Gateway is present, if not: re-init WC_Payment_Gateways
    if( ! in_array( 'WC_POS_Gateways_Cash', array_map( 'get_class', $gateways ) ) ){
      WC_Payment_Gateways::instance()->init();
      $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    }

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
      apply_filters( 'woocommerce_pos_load_gateway', $gateway );
    }

    ksort( $ordered_gateways, SORT_NUMERIC );
    return $ordered_gateways;
  }

  public function load_enabled_gateways(){
    $gateways = $this->load_gateways();
    $enabled = $this->get_enabled_gateway_ids();
    $default = $this->get('default_gateway');
    $_gateways = array();

    if($gateways): foreach($gateways as $gateway):
      $id = $gateway->id;
      if(in_array($id, $enabled) && isset($gateway->pos) && $gateway->pos){
        $gateway->default = $id == $default;
//        $gateway->enabled = 'yes'; // gets stomped later by init_settings()
        $_gateways[$id] = $gateway;
      }
    endforeach; endif;

    return $_gateways;
  }

  public function get_enabled_gateway_ids(){
    return array_keys( (array) $this->get('enabled'), true);
  }

}
