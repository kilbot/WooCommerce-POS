<?php

class RESTAPITest extends TestCase {

  protected $client;

  public function test_get_valid_http_response() {
    $response = $this->client->get(get_site_url());
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function test_get_valid_api_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('store', $data);
  }

}