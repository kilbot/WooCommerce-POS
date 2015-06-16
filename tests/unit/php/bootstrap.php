<?php

class Test_WC_POS {

  private $wp_tests_dir;

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->wp_tests_dir = getenv('WP_TESTS_DIR') ? getenv('WP_TESTS_DIR') : '/tmp/wordpress-tests-lib';

    require_once $this->wp_tests_dir . '/includes/functions.php';

    tests_add_filter( 'muplugins_loaded', array( $this, 'load_wc_pos' ) );
    tests_add_filter( 'setup_theme', array( $this, 'install_wc_pos' ) );

    require_once $this->wp_tests_dir . '/includes/bootstrap.php';
    activate_plugin(WP_CONTENT_DIR . '/plugins/woocommerce/woocommerce.php');

    $this->includes();
  }

  public function load_wc_pos() {
    require_once dirname( __FILE__ ) . '/../../../woocommerce-pos.php';
  }

  public function install_wc_pos() {
    WC_POS_Activator::activate(true);
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

new Test_WC_POS();