<?php

namespace WC_POS\Unit_Tests\Admin;

use WP_UnitTestCase;
use WC_POS\Admin\Settings;

class SettingsTest extends WP_UnitTestCase {

  private $db_version_option;
  private $idb_version_option;

  public function setUp(){
    $this->db_version_option = Settings::DB_PREFIX . 'db_version';
    $this->idb_version_option = Settings::DB_PREFIX . 'idb_version';
    delete_option( $this->db_version_option );
    delete_option( $this->idb_version_option );
  }

  public function tearDown() {
    delete_option( $this->db_version_option );
    delete_option( $this->idb_version_option );
  }

  public function test_get_db_version(){

    // should init with 0
    $this->assertEquals( 0, Settings::get_db_version() );

    // bump versions
    Settings::bump_versions();
    $this->assertEquals( \WC_POS\VERSION, Settings::get_db_version() );
  }

  public function test_get_idb_version(){

    // should init with 1
    $this->assertEquals( 1, Settings::get_idb_version() );

    // should handle non integers
    update_option( $this->idb_version_option, 'corrupt' );
    $this->assertEquals( 1, Settings::get_idb_version() );

  }

  public function test_bump_idb_version(){

    // should init with 1
    $this->assertEquals( 1, Settings::bump_idb_version() );

    // should increment version numbers
    $this->assertEquals( 2, Settings::bump_idb_version() );

  }

}