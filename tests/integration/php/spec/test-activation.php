<?php

namespace WC_POS\Integration_Tests;

use WC_POS\Framework\TestCase;

class ActivationTest extends TestCase {

  /**
   *
   */
  public function test_load() {
    $response = $this->client->get( wc_pos_url(), [
      'allow_redirects' => false
    ]);
    // expect 302 redirect to login
    $this->assertEquals(302, $response->getStatusCode());
  }

}
