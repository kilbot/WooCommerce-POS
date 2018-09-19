<?php

namespace WC_POS;

class Unit_Tests {


  public function __construct(){
//    ini_set( 'display_errors','on' );
//    error_reporting( E_ALL );
    $wp_tests_path = dirname(shell_exec('wp config path --allow-root')).'/wordpress-tests-lib';
    require_once $wp_tests_path . '/includes/functions.php';
    tests_add_filter( 'muplugins_loaded', array( $this, 'load' ) );
    require_once $wp_tests_path . '/includes/bootstrap.php';
  }

  public function load() {
//    require_once WP_PLUGIN_DIR . '/woocommerce-pos/vendor/autoload.php';
    require_once '/var/www/html/plugins/woocommerce/woocommerce.php';
    require_once '/var/www/html/plugins/woocommerce-pos/woocommerce-pos.php';
    WC()->api->includes();
  }

}

new Unit_Tests();
