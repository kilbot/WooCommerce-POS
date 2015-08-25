<?php
/**
 * POS Tax Class
 *
 * @class    WC_POS_Tax
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Tax {

  /**
   * Returns all tax classes, class => label
   * @return array
   */
  static public function tax_classes() {
    $classes = array(
      /* translators: woocommerce */
      '' => __( 'Standard', 'woocommerce' )
    );

    // get_tax_classes method introduced in WC 2.3
    if( method_exists( 'WC_Tax','get_tax_classes' ) ){
      $labels = WC_Tax::get_tax_classes();
    } else {
      $labels = array_filter( array_map( 'trim', explode( "\n", get_option( 'woocommerce_tax_classes' ) ) ) );
    }

    foreach( $labels as $label ){
      $classes[ sanitize_title($label) ] = $label;
    }

    return $classes;
  }

  /**
   * Returns base tax rates for all tax classes
   * @return array
   */
  static public function tax_rates() {
    $rates = array();

    foreach( self::tax_classes() as $class => $label ) {
      if( $rate = WC_Tax::get_base_tax_rates( $class ) ){
        // WC_Tax returns a assoc array with int as keys = world of pain in js
        // possibly change $key to $rate['id']
        $rates[$class] = $rate;
      }
    }

    return $rates;
  }

}