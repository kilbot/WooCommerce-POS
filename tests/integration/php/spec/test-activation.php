<?php

class ActivationTest extends PHPUnit_Framework_TestCase {

  protected $client;

  public function setUp() {
    $this->client = new GuzzleHttp\Client([
      'defaults' => ['exceptions' => false],
    ]);
  }

  public function test_load() {
    $response = $this->client->get( wc_pos_url(), [
      'allow_redirects' => false
    ]);
    // expect 302 redirect to login
    $this->assertEquals(302, $response->getStatusCode());
  }

  public function test_load_order() {
    // reverse plugin load order
    update_option('active_plugins', array(
      'woocommerce/woocommerce.php',
      'woocommerce-pos/woocommerce-pos.php'
    ));

    $response = $this->client->get( wc_pos_url(), [
      'allow_redirects' => false
    ]);
    // expect 302 redirect to login
    $this->assertEquals(302, $response->getStatusCode());

    // restore plugin load order
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce/woocommerce.php'
    ));
  }

  public function tearDown(){

  }

}