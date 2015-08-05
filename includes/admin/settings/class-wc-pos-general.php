<?php

/**
 * WP Checkout Settings Class
 *
 * @class    WC_POS_Admin_Settings_General
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_General extends WC_POS_Admin_Settings_Abstract {

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'general';
    /* translators: woocommerce */
    $this->label = __( 'General', 'woocommerce' );

    $this->defaults = array(
      'discount_quick_keys' => array('5', '10', '20', '25')
    );
  }

}