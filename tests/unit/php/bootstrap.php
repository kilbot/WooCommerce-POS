<?php

namespace WC_POS;

class Unit_Tests {

  private $wp_tests_dir;

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->wp_tests_dir = '/var/www/html/wp/latest/wordpress-tests-lib'; // default folder
    $lines = file('/var/www/html/wp-cli.yml', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $matches = preg_grep("/^path:(.*?)$/", $lines);
    if($matches) {
      $this->wp_tests_dir = str_replace(
        'wp/latest',
        trim(str_replace('path:','',$matches[0])),
        $this->wp_tests_dir
      );
    }

    require_once $this->wp_tests_dir . '/includes/functions.php';
    tests_add_filter( 'muplugins_loaded', array( $this, 'load' ) );
    require_once $this->wp_tests_dir . '/includes/bootstrap.php';
  }

  public function load() {
//    require_once WP_PLUGIN_DIR . '/woocommerce-pos/vendor/autoload.php';
    require_once '/var/www/html/plugins/woocommerce/woocommerce.php';
    require_once '/var/www/html/plugins/woocommerce-pos/woocommerce-pos.php';

    WC()->api->includes();
  }

}

new Unit_Tests();
