<?php

/**
* WP Admin Class
*
* @class    WC_POS_Admin
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Admin {

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();
    add_action( 'current_screen', array( $this, 'conditional_init' ) );
  }

  /**
   * Load admin subclasses
   */
  public function init() {
    new WC_POS_Admin_Menu();
    new WC_POS_Admin_Settings();
  }

  /**
   * Conditionally load subclasses
   * @param $current_screen
   */
  public function conditional_init( $current_screen ) {

    // Add setting to permalink page
    if( $current_screen->id == 'options-permalink' )
      new WC_POS_Admin_Permalink();

    // Add POS settings to orders pages
    if( $current_screen->id == 'shop_order' || $current_screen->id == 'edit-shop_order'  )
      new WC_POS_Admin_Orders();

  }

}