<?php

/**
 * Receipt Settings Class
 *
 * @class    WC_POS_Admin_Settings_Receipt_Options
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\Admin\Settings\Receipt;

class Options extends WC_POS\Admin\Settings\Page {

  protected static $instance;

  /**
   * @param
   */
  public function __construct() {
    $this->id = 'receipt_options';
    $this->label = __( 'Receipt Options', 'woocommerce-pos' );

    $this->defaults = array(
      'print_method'     => 'browser',
      'template_language' => 'html'
    );
  }

}