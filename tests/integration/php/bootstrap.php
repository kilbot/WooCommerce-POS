<?php

class Integration_Test_WC_POS {

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->includes();

  }

  private function includes(){

    if( is_readable( 'vendor/autoload.php' ) ){
      // travis
      require_once 'vendor/autoload.php';
    } else {
      // vvv
      require_once '/home/vagrant/.composer/vendor/autoload.php';
    }

  }

}

new Integration_Test_WC_POS();