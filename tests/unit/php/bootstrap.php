<?php

class Unit_Test_WC_POS {

  private $wp_tests_dir;

  public function __construct(){

    ini_set( 'display_errors','on' );
    error_reporting( E_ALL );

    $this->wp_tests_dir = '/tmp/wordpress-tests-lib';
    $this->includes();

    require_once $this->wp_tests_dir . '/includes/functions.php';
    
    tests_add_filter( 'muplugins_loaded', array( $this, 'load_wc_pos' ) );
//    tests_add_filter( 'setup_theme', array( $this, 'install_wc_pos' ) );

    require_once $this->wp_tests_dir . '/includes/bootstrap.php';
    activate_plugin(WP_CONTENT_DIR . '/plugins/woocommerce/woocommerce.php');
  }

  public function load_wc_pos() {
    require_once dirname( __FILE__ ) . '/../../../woocommerce-pos.php';
    new WC_POS();
  }

  /**
   * include wp-load
   * include composer autoloader
   */
  public function includes(){

    if( is_readable( 'vendor/autoload.php' ) ){
      // travis
      require_once 'vendor/autoload.php';
    } else {
      // vvv
      require_once '/home/vagrant/.composer/vendor/autoload.php';
    }

  }

//  public function install_wc_pos() {
//    WC_POS_Activator::activate(true);
//  }

}

new Unit_Test_WC_POS();