<?php
/**
 * Customer Settings
 *
 * @class 	  WC_POS_Pro_Admin_Settings_Customers
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

namespace WC_POS\Admin\Settings;

class Cart extends Page {

  protected static $instance;

  public function __construct() {
    $this->id    = 'cart';
    $this->label = /* translators: woocommerce */ __( 'Cart', 'woocommerce' );

    $this->defaults = array(
      'shipping' => array(
        'taxable' => true
      ),
      'fee' => array(
        'taxable' => true
      )
    );
  }

}