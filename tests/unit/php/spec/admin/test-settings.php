<?php

class AdminSettingsTest extends WP_UnitTestCase {

  private $db_version_option;
  private $idb_version_option;

  public function setUp(){
    $this->db_version_option = WC_POS_Admin_Settings::DB_PREFIX . 'db_version';
    $this->idb_version_option = WC_POS_Admin_Settings::DB_PREFIX . 'idb_version';
    delete_option( $this->db_version_option );
    delete_option( $this->idb_version_option );
  }

  public function tearDown() {
    delete_option( $this->db_version_option );
    delete_option( $this->idb_version_option );
  }

  public function test_get_db_version(){

    // should init with 0
    $this->assertEquals( 0, WC_POS_Admin_Settings::get_db_version() );

    // bump versions
    WC_POS_Admin_Settings::bump_versions();
    $this->assertEquals( WC_POS_VERSION, WC_POS_Admin_Settings::get_db_version() );
  }

  public function test_get_idb_version(){

    // should init with 1
    $this->assertEquals( 1, WC_POS_Admin_Settings::get_idb_version() );

    // should handle non integers
    update_option( $this->idb_version_option, 'corrupt' );
    $this->assertEquals( 1, WC_POS_Admin_Settings::get_idb_version() );

  }

  public function test_bump_idb_version(){

    // should init with 1
    $this->assertEquals( 1, WC_POS_Admin_Settings::bump_idb_version() );

    // should increment version numbers
    $this->assertEquals( 2, WC_POS_Admin_Settings::bump_idb_version() );

  }

}