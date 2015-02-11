<?php

class SettingsTest extends WP_UnitTestCase {

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

  function test_get_settings() {

    // dummy data
    $data = array(
      'key' => 'value',
      'nested' => array(
        'key' => 'value'
      )
    );

    // insert to db
    update_option( WC_POS_Admin_Settings::DB_PREFIX . 'test', $data );

    // get full data array
    $settings = WC_POS_Admin_Settings::get_settings('test');
    $this->assertEquals( $settings, $data );

    // get specific key
    $settings = WC_POS_Admin_Settings::get_settings('test', 'nested');
    $this->assertEquals( $settings, array('key' => 'value') );

    WC_POS_Admin_Settings::delete_settings('test');

  }

  function test_save_settings() {

    // dummy data
    $data = array(
      'key' => 'value',
      'nested' => array(
        'key' => 'value'
      )
    );

    $response = WC_POS_Admin_Settings::save_settings('test', $data);
    $this->assertEquals( $response['response']['result'], 'success' );

  }
}