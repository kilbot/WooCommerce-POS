<?php

class AccessSettingsTest extends WP_UnitTestCase {

  function test_capabilities_array(){
    $pos_capabilities = WC_POS_Admin_Settings_Access::$pos_capabilities;
    $this->assertNotEmpty( $pos_capabilities );

    $woo_capabilities = WC_POS_Admin_Settings_Access::$woo_capabilities;
    $this->assertNotEmpty( $woo_capabilities );
  }

  function test_bootstrap_data(){
    $access = new WC_POS_Admin_Settings_Access();
    $this->assertNotEmpty( $access->get_data() );

    $pos_caps = WC_POS_Admin_Settings_Access::$pos_capabilities;
    $woo_caps = WC_POS_Admin_Settings_Access::$woo_capabilities;

    $data = $access->get_data();
    $pos_data = array_keys($data['roles']['administrator']['pos_capabilities']);
    $woo_data = array_keys($data['roles']['administrator']['woo_capabilities']);

    // admin should have all capabilities
    $this->assertSame(array_diff($pos_caps,$pos_data), array_diff($pos_data,$pos_caps));
    $this->assertSame(array_diff($woo_caps,$woo_data), array_diff($woo_data,$woo_caps));

  }

  function test_update_capabilities(){

    // set shop_manager capabilities
    $role = get_role('shop_manager');
    $role->add_cap('access_woocommerce_pos');
    $role->remove_cap('manage_woocommerce_pos');
    $role->remove_cap('promote_users');


    // dummy data with reversed capabilities
    $data = array(
      'roles' => array(
        'shop_manager' => array(
          'pos_capabilities' => array(
            'access_woocommerce_pos' => false,
            'manage_woocommerce_pos' => true,
            // security test
            // save function should only change allowed capabilities
            'promote_users' => true
          )
        )
      )
    );

    $access = new WC_POS_Admin_Settings_Access();
    $access->save($data);

    //
    $role = get_role('shop_manager');
    $this->assertArrayNotHasKey('access_woocommerce_pos', $role->capabilities);
    $this->assertTrue($role->capabilities['manage_woocommerce_pos']);
    $this->assertArrayNotHasKey('promote_users', $role->capabilities);

  }

}