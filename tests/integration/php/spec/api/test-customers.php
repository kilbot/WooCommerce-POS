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
    $username = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username,
//      'user_email' => 'woo@' . $username . '.com',
//      'first_name' => $first_name,
//      'last_name' => $last_name
    ) );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($username, 6),
        'filter[qFields]' => 'username'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

  /**
   *
   */
  public function test_customer_simple_email_search(){
    $username = $this->generate_random_string();
    $email = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username,
      'user_email' => 'woo@' . $email . '.com',
//      'first_name' => $first_name,
//      'last_name' => $last_name
    ) );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($email, 0, 6),
        'filter[qFields]' => 'email'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

  /**
   *
   */
  public function test_customer_simple_first_name_search(){
    $username = $this->generate_random_string();
    $first_name = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username,
      'first_name' => $first_name,
//      'last_name' => $last_name
    ) );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($first_name, 0, 6),
        'filter[qFields]' => 'first_name'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

  /**
   *
   */
  public function test_customer_simple_last_name_search(){
    $username = $this->generate_random_string();
    $last_name = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username,
      'last_name' => $last_name
    ) );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($last_name, 0, 6),
        'filter[qFields]' => 'last_name'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

  /**
   *
   */
  public function test_customer_simple_company_search(){
    $username = $this->generate_random_string();
    $company = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username
    ) );

    update_user_meta( $customer_id, 'billing_company', $company );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($company, 0, 6),
        'filter[qFields]' => 'billing_address.company'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

  /**
   *
   */
  public function test_customer_simple_phone_search(){
    $username = $this->generate_random_string();
    $phone = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username
    ) );

    update_user_meta( $customer_id, 'billing_phone', $phone );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => substr($phone, 0, 6),
        'filter[qFields]' => 'billing_address.phone'
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

  /**
   *
   */
  public function test_customer_complex_id_search(){
    $username = $this->generate_random_string();

    // create customer
    $customer_id = wp_insert_user( array(
      'user_pass' => 'password',
      'user_login' => $username
    ) );

    $response = $this->client->get('customers', [
      'query' => [
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'id',
            'query'   => $customer_id
          )
        )
      ]
    ]);
    $data = $response->json();

    $this->assertCount(1, $data['customers']);
    $this->assertEquals($customer_id, $data['customers'][0]['id']);
  }

}