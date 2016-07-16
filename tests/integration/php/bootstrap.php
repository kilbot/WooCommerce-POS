<?php

namespace WC_POS;

class Integration_Tests {

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
    require_once( __DIR__.'/../../../../../../wp-load.php' );
    require_once '/root/.composer/vendor/autoload.php'; // required to load Guzzle
    require_once 'framework/testcase.php';
  }

  /**
   * runs after all tests are complete
   */
  public function shutdown(){

  }

}

new Integration_Tests();