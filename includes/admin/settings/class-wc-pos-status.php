<?php

/**
 * Administrative Tools
 *
 * @class    WC_POS_Admin_Settings_Tools
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Status extends WC_POS_Admin_Settings_Abstract {

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'status';
    /* translators: woocommerce */
    $this->label = __( 'System Status', 'woocommerce' );
  }

}