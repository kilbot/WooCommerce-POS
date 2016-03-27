<?php

namespace WC_POS;

use WC_Tax;

class Integration_Tests {

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->includes();
    $this->setup();
    register_shutdown_function( array( $this, 'shutdown' ) );
  }

  /**
   * include wp-load
   * include composer autoloader
   */
  public function includes(){
    require_once(__DIR__.'/../../../../../../wp-load.php');
    require_once 'vendor/autoload.php';
  }

  public function setup(){
    switch_theme('WooCommerce-POS-Test-Theme', 'WooCommerce-POS-Test-Theme');
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce-pos-test/index.php',
      'woocommerce/woocommerce.php'
    ));

    $this->import_dummy_tax();
  }

  /**
   * copy of import function: WC_Tax_Rate_Importer->import()
   * https://github.com/woothemes/woocommerce/blob/master/includes/admin/importers/class-wc-tax-rate-importer.php
   */
  private function import_dummy_tax(){

    // clear tax rate tables
    global $wpdb;
    $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}woocommerce_tax_rates");
    $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}woocommerce_tax_rate_locations");

    $taxes = array(
      array('GB','*','*','*','20.0000','VAT',1,1,1,''),
      array('GB','*','*','*','5.0000','VAT',1,1,1,'reduced-rate'),
      array('GB','*','*','*','0.0000','VAT',1,1,1,'zero-rate'),
      array('US','*','*','*','10.0000','US',1,1,1,''),
      array('US','AL','12345; 123456','*','2.0000','US AL',2,1,1,'')
    );

    $loop = 0;

    foreach ( $taxes as $tax ) {
      list( $country, $state, $postcode, $city, $rate, $name, $priority, $compound, $shipping, $class ) = $tax;
      $tax_rate = array(
        'tax_rate_country'  => $country,
        'tax_rate_state'    => $state,
        'tax_rate'          => $rate,
        'tax_rate_name'     => $name,
        'tax_rate_priority' => $priority,
        'tax_rate_compound' => $compound ? 1 : 0,
        'tax_rate_shipping' => $shipping ? 1 : 0,
        'tax_rate_order'    => $loop ++,
        'tax_rate_class'    => $class
      );
      $tax_rate_id = WC_Tax::_insert_tax_rate( $tax_rate );
      WC_Tax::_update_tax_rate_postcodes( $tax_rate_id, wc_clean( $postcode ) );
      WC_Tax::_update_tax_rate_cities( $tax_rate_id, wc_clean( $city ) );
    }

  }

  /**
   * runs after all tests are complete
   */
  public function shutdown(){
    switch_theme('twentyfifteen', 'twentyfifteen');
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce/woocommerce.php'
    ));
  }

}

new Integration_Tests();