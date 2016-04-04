<?php

namespace WC_POS\Integration_Tests;

use WC_POS\Framework\TestCase;

class APITest extends TestCase {

  /**
   * Make sure server is up
   */
  public function test_get_valid_http_response() {
    $response = $this->client->get(get_site_url());
    $this->assertEquals(200, $response->getStatusCode());
  }

  /**
   * Make sure rest is enabled and working
   */
  public function test_get_valid_api_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('store', $data);
  }

  /**
   * Test authentication
   * todo: logout
   */
  public function test_get_api_authentication() {
    $response = $this->client->get('products');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
  }

}