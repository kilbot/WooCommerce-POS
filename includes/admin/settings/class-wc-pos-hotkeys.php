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

  private $labels;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'hotkeys';
    $this->label = _x( 'HotKeys', 'keyboard shortcuts', 'woocommerce-pos' );

    $this->default_settings = array(
      'hotkeys' => array(
        'help' => array(
          'key' => '?'
        ),
        'barcode' => array(
          'key' => 'B'
        ),
        'search' => array(
          'key' => 'V'
        ),
        'sync' => array(
          'key' => 'S'
        )
      )
    );

    $this->labels = array(
      'help'    => __( 'Help screen', 'woocommerce-pos' ),
      'barcode' => __( 'Barcode search', 'woocommerce-pos' ),
      'search'  => /* translators: woocommerce */__( 'Search', 'woocommerce' ),
      'new'     => __( 'New order', 'woocommerce-pos' ),
      'sync'    => __( 'Sync with server', 'woocommerce-pos' )
    );
  }

  public function get_data($key = false){
    $data = $this->stored_data() ? $this->stored_data() : $this->default_settings;
    $data['hotkeys'] = array_merge($this->default_settings['hotkeys'], $data['hotkeys']);

    foreach($data['hotkeys'] as $slug => &$arr){
      $arr['label'] = $this->labels[$slug];
    }

    if($key && is_array($data)) {
      $data = array_key_exists($key, $data) ? $data[$key] : false;
    }

    return $data;
  }

}