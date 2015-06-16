<?php

class ProductsAPITest extends PHPUnit_Framework_TestCase {

  protected $client;

  public function setUp() {
    $this->client = new GuzzleHttp\Client([
      'base_url' => 'http://woopos.dev/wc-api/v2/products/',
      'defaults' => ['exceptions' => false],
      // 'headers' => [ 'X-WC-POS' => 1 ],
      // 'cookies' => true

      // Could not get cookies to work using GuzzleHTTP
      // instead using theme functions.php for access
    ]);
  }

  public function test_get_valid_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
  }

}