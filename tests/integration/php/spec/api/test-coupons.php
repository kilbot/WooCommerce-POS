<?php

namespace WC_POS\Integration_Tests\API;

use WC_POS\Framework\TestCase;

class Coupons extends TestCase {

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get('coupons');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('coupons', $data);
  }

  /**
   *
   */
  public function test_code_search(){
    $coupon_code = $this->generate_random_string();

    $coupon = array(
      'post_title'   => $coupon_code,
      'post_content' => '',
      'post_status'  => 'publish',
      'post_author'  => 1,
      'post_type'    => 'shop_coupon'
    );

    $new_coupon_id = wp_insert_post( $coupon );

    $response = $this->client->get('coupons', [
      'query' => [
        'filter[q]' => substr($coupon_code, 6),
        'filter[qFields]' => 'code'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['coupons']);
    $this->assertEquals($new_coupon_id, $data['coupons'][0]['id']);

    wp_delete_post($new_coupon_id);
  }

}