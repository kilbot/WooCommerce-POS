<?php

/**
 * Administrative Tools
 *
 * @class    WC_POS_Admin_Settings_Tools
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\Admin\Settings;

class Status extends Page {

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