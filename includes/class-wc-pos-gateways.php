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

  protected static $instance;

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'woocommerce_payment_gateways', array( $this, 'payment_gateways' ) );
    add_action( 'woocommerce_pos_load_gateway', array( $this, 'load_gateway' ) );

    static::$instance = $this;
  }

  /**
   * Returns the Singleton instance of this class.
   * - late static binding requires PHP 5.3+
   * @return Singleton
   */
  public static function get_instance() {
    $class = get_called_class();
    if (null === static::$instance) {
      static::$instance = new $class();
    }
    return static::$instance;
  }

  /**
   * Add POS gateways
   * @param $gateways
   * @return array
   */
  public function payment_gateways( array $gateways ) {
    // don't show POS gateways on WC settings page
    if( is_admin() && function_exists('get_current_screen') ){
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