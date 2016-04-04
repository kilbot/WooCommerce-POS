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
    $data = $response->json();
    $this->assertArrayHasKey('customers', $data);
  }

  /**
   *
   */
  public function test_customer_roles_settings(){

    // set the decimal_qty option
    $option_key = Settings::DB_PREFIX . 'customers';
    update_option( $option_key, array('customer_roles' => array('all')) );

    $response = $this->client->get('customers');
    $data = $response->json();
    $this->assertArrayHasKey('customers', $data);

    $this->assertEquals('administrator', $data['customers'][0]['role']); // admin
    $this->assertEquals('subscriber', $data['customers'][1]['role']);    // wooteam

    update_option( $option_key, array('customer_roles' => array('subscriber')) );

    $response = $this->client->get('customers');
    $data = $response->json();

    $this->assertEquals('subscriber', $data['customers'][0]['role']);

    update_option( $option_key, array('customer_roles' => array('all')) );

  }

  /**
   *
   */
  public function test_customer_simple_username_search(){
    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => 'wootea',
        'filter[fields]' => 'username'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals('wooteam', $data['customers'][0]['username']);
  }

  /**
   *
   */
  public function test_customer_simple_email_search(){
    $email = 'woo@' . $this->generate_random_string() . '.com';

    add_filter('send_email_change_email', '__return_false');
    wp_update_user( array(
      'ID' => 2,
      'user_email' => $email
    ));

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($email, 0, 6),
        'filter[fields]' => 'email'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($email, $data['customers'][0]['email']);
  }

  /**
   *
   */
  public function test_customer_simple_first_name_search(){
    $first_name = $this->generate_random_string();
    wp_update_user( array(
      'ID' => 2,
      'first_name' => $first_name
    ));

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($first_name, 0, 6),
        'filter[fields]' => 'first_name'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($first_name, $data['customers'][0]['first_name']);
  }

  /**
   *
   */
  public function test_customer_simple_last_name_search(){
    $last_name = $this->generate_random_string();
    wp_update_user( array(
      'ID' => 2,
      'last_name' => $last_name
    ));

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($last_name, 0, 6),
        'filter[fields]' => 'last_name'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($last_name, $data['customers'][0]['last_name']);
  }

  /**
   *
   */
  public function test_customer_simple_company_search(){
    $company = $this->generate_random_string();
    update_user_meta( 2, 'billing_company', $company );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($company, 0, 6),
        'filter[fields]' => 'billing_address.company'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($company, $data['customers'][0]['billing_address']['company']);
  }

  /**
   *
   */
  public function test_customer_simple_phone_search(){
    $phone = $this->generate_random_string();
    update_user_meta( 2, 'billing_phone', $phone );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($phone, 0, 6),
        'filter[fields]' => 'billing_address.phone'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($phone, $data['customers'][0]['billing_address']['phone']);
  }

  /**
   *
   */
  public function test_customer_complex_id_search(){
    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'id',
            'query'   => '2'
          )
        )
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals(2, $data['customers'][0]['id']);
  }

}