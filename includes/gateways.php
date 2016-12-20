<?php

/**
* Loads the POS Payment Gateways
*
* @class    WC_POS_Gateways
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.wcpos.com
*/

namespace WC_POS;

class Gateways {

  protected static $instance;

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'woocommerce_payment_gateways', array( $this, 'payment_gateways' ) );
    add_action( 'woocommerce_pos_load_gateways', array( $this, 'load_gateways' ) );

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
    global $plugin_page;

    // don't show POS gateways on WC settings page or online checkout
    if( is_admin() && $plugin_page == 'wc-settings' || !is_admin() && !is_pos() ){
      return $gateways;
    }

    return array_merge($gateways, array(
      'WC_POS\Gateways\Cash',
      'WC_POS\Gateways\Card'
    ));
  }

  /**
   * Enable POS gateways
   * @param $gateways
   * @return bool
   */
  public function load_gateways( $gateways ) {
    foreach( $gateways as $gateway ){
      $gateway->pos = in_array( $gateway->id, array( 'pos_cash', 'pos_card', 'paypal' ) );
    }
    return $gateways;
  }

}