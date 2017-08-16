<?php

namespace WC_POS\Integration_Tests\API;

use WC_POS\Framework\TestCase;
use GuzzleHttp\Client;

class POSTest extends TestCase {

  /**
   * Make sure rest is enabled and working
   *
   *
   */
  public function test_get_valid_api_response() {
    $response = $this->client->get('pos');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('params', $data);
  }

}