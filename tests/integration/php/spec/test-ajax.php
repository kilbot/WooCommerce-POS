<?php

class AJAXTest extends PHPUnit_Framework_TestCase {

  protected $client;
  protected $nonce;

  public function setUp() {
    $this->nonce = wp_create_nonce( WC_POS_PLUGIN_NAME );

    $this->client = new GuzzleHttp\Client( array(
      'base_url' => admin_url('admin-ajax.php'),
      'defaults' => array(
        'headers' => array(
          'X-WC-POS' => '1'
        ),
        'exceptions' => false,
        'cookies' => true
      )
    ) );

    $this->log_in_user();
  }

  /**
   * Helper functions
   */
  private function log_in_user(){
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce-pos-test/index.php',
      'woocommerce/woocommerce.php'
    ));
    update_option('woocommerce_pos_test_logged_in_user', 1);
  }

  private function log_out_user(){
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce/woocommerce.php'
    ));
    delete_option('woocommerce_pos_test_logged_in_user');
  }

  /**
   *
   */
  public function test_http_methods(){
    $response = $this->client->put('', array(
      'query' => array(
        'action' => 'wc_pos_test_http_methods',
        'security' => $this->nonce
      ),
      'json' => array(
        'foo' => 'bar'
      )
    ));
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(array(
      'method' => 'put',
      'payload' => array(
        'foo' => 'bar'
      )
    ), $response->json());
  }

  public function tearDown() {
    $this->log_out_user();
  }
}