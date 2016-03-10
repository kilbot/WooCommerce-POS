<?php

/**
 * Receipt Template Class
 *
 * @class    WC_POS_Admin_Settings_Receipt_Template
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\Admin\Settings\Receipt;

use WC_POS\Admin\Settings\Page;

class Template extends Page {

  protected static $instance;

  /**
   * @param
   */
  public function __construct() {
    $this->id = 'receipt_template';
    $this->label = __( 'Receipt Template', 'woocommerce-pos' );
  }

}