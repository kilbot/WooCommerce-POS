<?php

/**
* Loads the POS Payment Gateways
*
* @class    WC_POS_Gateways
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Gateways {

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();
    add_action( 'woocommerce_payment_gateways', array( $this, 'payment_gateways' ) );
    add_action( 'woocommerce_pos_load_gateway', array( $this, 'load_gateway' ) );
  }

  /**
   * Sub classes
   */
  private function init(){
    // admin only
    if (is_admin() && (!defined('DOING_AJAX') || !DOING_AJAX)) {
      new WC_POS_Admin_Gateways();
    }
  }

  /**
   * Add POS gateways
   * @param $gateways
   * @return array
   */
  public function payment_gateways( array $gateways ) {
    // don't show POS gateways on WC settings page
    if(is_admin()){
      $screen = get_current_screen();
      if( !empty($screen) && $screen->id == 'woocommerce_page_wc-settings' ) {
        return $gateways;
      }
    }

    return array_merge($gateways, array(
      'WC_POS_Gateways_Cash',
      'WC_POS_Gateways_Card'
    ));
  }

  /**
   * Enable POS gateways
   * @param $gateway
   * @return bool
   */
  public function load_gateway( WC_Payment_Gateway $gateway ) {
    $gateway->pos = in_array( $gateway->id, array( 'pos_cash', 'pos_card', 'paypal' ) );
    return $gateway;
  }

}