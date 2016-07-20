<?php

class Integration_Test_WC_POS {

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->includes();
    register_shutdown_function( array( $this, 'shutdown' ) );
  }

  /**
   * include wp-load
   * include composer autoloader
   */
  public function includes(){
    require_once(__DIR__.'/../../../../../../wp-load.php');
    require_once '/root/.composer/vendor/autoload.php'; // required to load Guzzle
  }

  public function setup(){
    switch_theme('WooCommerce-POS-Test-Theme', 'WooCommerce-POS-Test-Theme');
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce-pos-test/index.php',
      'woocommerce/woocommerce.php'
    ));
  }

  /**
   * runs after all tests are complete
   */
  public function shutdown(){
    switch_theme('twentyfifteen', 'twentyfifteen');
  }

}

new Integration_Test_WC_POS();