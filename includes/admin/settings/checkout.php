<?php

/**
* WP Checkout Settings Class
*
* @class    WC_POS_Admin_Settings_Checkout
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.wcpos.com
*/

namespace WC_POS\Admin\Settings;

use WC_Payment_Gateways;

class Checkout extends Page {

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

  /**
   * @return mixed|void
   */
  public function load_gateways() {
    $gateways = WC_Payment_Gateways::instance()->payment_gateways;
    $order = $this->get('gateway_order');
    
    // some poorly written plugins will init WC_Payment_Gateways before WP init
    // check to see if POS Cash Gateway is present, if not: re-init WC_Payment_Gateways
    if( ! in_array( 'WC_POS\Gateways\Cash', array_map( 'get_class', $gateways ) ) ){
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
      $settings = new Gateways($gateway->id);
      $settings->merge_settings($gateway); // @todo remove this, use get_title() etc
    }

    ksort( $ordered_gateways, SORT_NUMERIC );
    return apply_filters( 'woocommerce_pos_load_gateways', $ordered_gateways );
  }

  /**
   * @return mixed|void
   */
  public function load_enabled_gateways() {
    $gateways = $this->load_gateways();
    $enabled = $this->get_enabled_gateway_ids();
    $default = $this->get( 'default_gateway' );
    $enabled_gateways = array();

    if ( $gateways ): foreach ( $gateways as $gateway ):
      $id = $gateway->id;
      if ( in_array( $id, $enabled ) && isset( $gateway->pos ) && $gateway->pos ) {
        $gateway->default = $id == $default;
        // $gateway->enabled = 'yes'; // gets stomped later by init_settings()
        $enabled_gateways[ $id ] = $gateway;
      }
    endforeach; endif;

    return apply_filters( 'woocommerce_pos_load_enabled_gateways', $enabled_gateways );
  }

  /**
   * Convenience function, returns POS enabled gateway ids
   * @return array
   */
  public function get_enabled_gateway_ids(){
    return array_keys( (array) $this->get('enabled'), true);
  }

}
