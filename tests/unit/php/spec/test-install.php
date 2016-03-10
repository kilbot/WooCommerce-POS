<?php

namespace WC_POS\Unit_Tests;

use WC_POS\Activator;
use WP_UnitTestCase;

class Install extends WP_UnitTestCase {

  private $activator;

  function setUp(){
    $this->activator = new Activator();
    wp_set_current_user(1);
  }

//  function test_version_check() {
//    $this->activator->version_check();
//    $version = get_option( 'woocommerce_pos_db_version' );
//    $this->assertEquals( WC_POS_VERSION, $version );
//  }

  function test_add_pos_capability(){
    $this->assertTrue( user_can( 1, 'manage_woocommerce_pos' ) );
    $this->assertTrue( user_can( 1, 'access_woocommerce_pos' ) );
  }

}