<?php

class RESTAPITest extends WP_UnitTestCase {

  protected $client;

  public function setUp() {

    // check api url
    $wc_api = get_woocommerce_api_url('');
    $this->assertEquals('http://woopos.dev/wc-api/v2/', $wc_api);

    $this->client = new GuzzleHttp\Client([
      'base_url' => $wc_api,
      'defaults' => ['exceptions' => false]
    ]);
  }

  public function test_get_valid_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('store', $data);
  }

}