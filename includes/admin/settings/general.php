<?php

/**
 * WP Checkout Settings Class
 *
 * @class    WC_POS_Admin_Settings_General
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\Admin\Settings;

class General extends Page {

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'general';
    /* translators: woocommerce */
    $this->label = __( 'General', 'woocommerce' );

//    $this->defaults = array();
  }

}