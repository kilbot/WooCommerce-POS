<?php

class Integration_Test_WC_POS {

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->includes();
  }

  /**
   * include wp-load
   * include composer autoloader
   */
  public function includes(){
    require_once(__DIR__.'/../../../../../../wp-load.php');
    require_once('/root/.composer/vendor/autoload.php'); // required to load Guzzle
    require_once('framework/testcase.php');
  }

  public function setup(){

  }

  /**
   * runs after all tests are complete
   */
  public function shutdown(){

  }

}

new Integration_Test_WC_POS();