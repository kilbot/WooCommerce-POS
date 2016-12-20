<?php

/**
 * POS Receipts Settings Class
 *
 * @class    WC_POS_Admin_Settings_Receipts
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\Admin\Settings;

class Receipts extends Page {

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'receipts';
    $this->label = __( 'Receipts', 'woocommerce-pos' );

    $this->section_handlers = array(
      'receipt_options'  => '\WC_POS\Admin\Settings\Receipt\Options',
      'receipt_template' => '\WC_POS\Admin\Settings\Receipt\Template'
    );
  }

  /**
   * @param null $args
   * @return array|bool|mixed|void
   */
  public function get( $args = null ) {
    $section = isset( $args[ 'section' ] ) ? $args[ 'section' ] : $args;
    $key = isset( $args[ 'key' ] ) ? $args[ 'key' ] : null;

    if ( $section ) {
      $handler = $this->section_handlers[ $section ];
      if ( $handler ) {
        $settings = $handler::get_instance();
        return $settings->get( $key );
      }
      return false;
    }

    $data = array();
    foreach ( $this->section_handlers as $id => $handler ) {
      $settings = $handler::get_instance();
      $data[ $key ] = $settings->get();
    }
    return $data;

  }

}