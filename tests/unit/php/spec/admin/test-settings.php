<?php

class AdminSettingsTest extends WP_UnitTestCase {

  function setUp(){

  }

  function test_delete_settings(){
    update_option( WC_POS_Admin_Settings::DB_PREFIX . 'test', 'dummy' );
    WC_POS_Admin_Settings::delete_settings('test');
    $settings = get_option(WC_POS_Admin_Settings::DB_PREFIX . 'test');
    $this->assertFalse($settings);
  }

  function test_delete_all_settings(){
    update_option( WC_POS_Admin_Settings::DB_PREFIX . 'test1', 'dummy' );
    update_option( WC_POS_Admin_Settings::DB_PREFIX . 'test2', 'dummy' );
    WC_POS_Admin_Settings::delete_all_settings();

    global $wpdb;
    $prefix = WC_POS_Admin_Settings::DB_PREFIX;
    $rows = $wpdb->get_var( "
      SELECT COUNT(*) FROM {$wpdb->options}
      WHERE option_name
      LIKE '{$prefix}%'"
    );

    $this->assertEquals( $rows, 0 );
  }
}