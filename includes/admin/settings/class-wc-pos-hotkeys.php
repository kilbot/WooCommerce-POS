<?php

/**
 * Administrative Tools
 *
 * @class    WC_POS_Admin_Settings_Tools
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_HotKeys extends WC_POS_Admin_Settings_Abstract {

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'hotkeys';
    $this->label = _x( 'HotKeys', 'keyboard shortcuts', 'woocommerce-pos' );

    $this->default_settings = array(
      'hotkeys' => array(
        'help' => array(
          'label' => __( 'Help screen', 'woocommerce-pos' ),
          'key' => '?'
        ),
        'barcode' => array(
          'label' => __( 'Barcode search', 'woocommerce-pos' ),
          'key' => 'ctrl+b'
        ),
        'sync' => array(
          'label' => __( 'Sync with server', 'woocommerce-pos' ),
          'key' => 'ctrl+s'
        )
      )
    );
  }

//  public function get_data(){
//    apply_filters( 'woocommerce_pos_hotkeys', $keys );
//  }

}