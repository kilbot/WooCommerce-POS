<?php

namespace WC_POS\Integration_Tests\API;

use WC_POS\Admin\Settings;
use WC_POS\Framework\TestCase;

class CustomersTest extends TestCase {

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get('customers');
    $this->assertEquals(200, $response->getStatusCode());
  }

}