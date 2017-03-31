<?php

class Unit_Test_WC_POS {

  private $wp_tests_dir;

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->wp_tests_dir = '/var/www/html/wordpress-tests-lib';

    require_once $this->wp_tests_dir . '/includes/functions.php';
    tests_add_filter( 'muplugins_loaded', array( $this, 'load_wc_pos' ) );
    require_once $this->wp_tests_dir . '/includes/bootstrap.php';

    // disable depreciation notices for WC 3+
    if( version_compare( WC()->version, '3', '>=' ) ){
      add_filter('doing_it_wrong_trigger_error', '__return_false');
    }
  }

  public function load_wc_pos() {
    require_once WP_PLUGIN_DIR . '/woocommerce/woocommerce.php';
    require_once WP_PLUGIN_DIR . '/woocommerce-pos/woocommerce-pos.php';
  }

}

new Unit_Test_WC_POS();