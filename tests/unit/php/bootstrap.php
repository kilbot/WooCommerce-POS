<?php

namespace WC_POS;

class Unit_Tests {

  private $wp_tests_dir;

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->wp_tests_dir = '/var/www/html/latest/wordpress-tests-lib';

    require_once $this->wp_tests_dir . '/includes/functions.php';
    tests_add_filter( 'muplugins_loaded', array( $this, 'load' ) );
    require_once $this->wp_tests_dir . '/includes/bootstrap.php';
  }

  public function load() {
    require_once WP_PLUGIN_DIR . '/woocommerce-pos/vendor/autoload.php';
    require_once WP_PLUGIN_DIR . '/woocommerce/woocommerce.php';
    require_once WP_PLUGIN_DIR . '/woocommerce-pos/woocommerce-pos.php';

    WC()->api->includes();
  }

}

new Unit_Tests();