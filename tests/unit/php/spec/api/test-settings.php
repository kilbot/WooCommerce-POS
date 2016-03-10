<?php

namespace WC_POS\Unit_Tests\API;

use WC_POS\Admin\Settings as Admin_Settings;
use WC_POS\API\Settings;
use WP_UnitTestCase;

class SettingsTest extends WP_UnitTestCase {

  private $settings_api;

  function setUp(){
    $this->settings_api = new Settings( $this->mock_api_server() );
  }

  function mock_api_server(){
    $stub = $this->getMockBuilder('WC_API_Server')
      ->disableOriginalConstructor()
      ->getMock();

    return $stub;
  }

//  function test_delete_settings(){
//    update_option( WC_POS_Admin_Settings::DB_PREFIX . 'test', 'dummy' );
//    $this->settings_api->delete_settings('test');
//    $settings = get_option(WC_POS_Admin_Settings::DB_PREFIX . 'test');
//    $this->assertFalse($settings);
//  }

  function test_delete_all_settings(){
    update_option( Admin_Settings::DB_PREFIX . 'test1', 'dummy' );
    update_option( Admin_Settings::DB_PREFIX . 'test2', 'dummy' );
    $this->settings_api->delete_all_settings();

    global $wpdb;
    $prefix = Admin_Settings::DB_PREFIX;
    $rows = $wpdb->get_var( "
      SELECT COUNT(*) FROM {$wpdb->options}
      WHERE option_name
      LIKE '{$prefix}%'"
    );

    $this->assertEquals( $rows, 0 );
  }
}