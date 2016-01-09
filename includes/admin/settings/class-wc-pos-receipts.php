<?php

/**
 * POS Receipts Settings Class
 *
 * @class    WC_POS_Admin_Settings_Receipts
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Receipts extends WC_POS_Admin_Settings_Abstract {

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'receipts';
    $this->label = __( 'Receipts', 'woocommerce-pos' );

    $this->section_handlers = array(
      'WC_POS_Admin_Settings_Receipt_Options',
      'WC_POS_Admin_Settings_Receipt_Template'
    );
  }

}