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

class HotKeys extends Page {

  protected static $instance;
  private $labels;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'hotkeys';
    $this->label = _x( 'HotKeys', 'keyboard shortcuts', 'woocommerce-pos' );

    $this->defaults = array(
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

  public function get($key = false){
    $data = get_option( $this->option_name() );
    if(!$data){ $data = $this->defaults; }
    $data['hotkeys'] = array_merge($this->defaults['hotkeys'], $data['hotkeys']);

    foreach($data['hotkeys'] as $slug => &$arr){
      $arr['label'] = $this->labels[$slug];
    }

    if($key && is_array($data)) {
      $data = array_key_exists($key, $data) ? $data[$key] : false;
    }

    return $data;
  }

}