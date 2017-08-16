<?php

/**
 * Extend PHPUnit_Framework_TestCase with helper methods
 */

namespace WC_POS\Framework;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;

class TestCase extends \PHPUnit_Framework_TestCase {

  protected $client;

  /**
   *
   */
  public function setUp() {
    parent::setUp();

    $this->login();
    $rest_nonce = wp_create_nonce( 'wp_rest' );

    $this->client = new Client([
      'base_url' => get_wcpos_api_url( '' ),
      'defaults' => [
        'exceptions' => false,
        'cookies' => true,
        'headers' => [
          'X-WC-POS' => '1',
          'X-WP-Nonce' => $rest_nonce // this doesn't work?
        ]
      ]
    ]);

  }

  /**
   * Login through wp-login.php, sets cookie
   */
  protected function login(){

    $client = new Client([
      'base_url' => wp_login_url(),
      'defaults' => [
        'exceptions' => false,
        'cookies' => true
      ]
    ]);

    $client->post('', [
      'body' => [
        'log' => 'admin',
        'pwd' => 'password',
      ]
    ]);

  }

  /**
   * Logout
   */
  protected function logout(){
    $client = new Client([
      'base_url' => wp_logout_url(),
      'defaults' => [
        'exceptions' => false,
        'cookies' => true
      ]
    ]);

    $client->get('');
  }

  /**
   * @param int $length
   * @return string
   */
  protected function generate_random_string($length=10) {
    $string = '';
    $characters = "ABCDEFHJKLMNPRTVWXYZabcdefghijklmnopqrstuvwxyz";
    for ($p = 0; $p < $length; $p++) {
      $string .= $characters[mt_rand(0, strlen($characters)-1)];
    }
    return $string;
  }
  /**
   * @param int $id
   * @return mixed
   */
  protected function get_product( $id ){
    $response = $this->client->get( 'products/' . $id );
    $data = $response->json();
    $data = isset($data['product']) ? $data['product'] : $data;
    return $data;
  }
  /**
   * @return mixed
   */
  protected function get_random_product_id() {
    $random_product = $this->get_random_product();
    return $random_product['id'];
  }
  /**
   * @return mixed
   */
  protected function get_random_product() {
    $response = $this->client->get( 'products',
      array(
        'query' => array(
          'per_page'=> '100'
        )
      )
    );
    $data = $response->json();
    $data = isset($data['products']) ? $data['products'] : $data;
    $key = array_rand( $data );
    return $data[$key];
  }
  /**
   * @param $response
   */
  protected function print_response_body( $response ) {
    echo $response->getBody();
  }
  /**
   * @param $response
   * @param int $bytes
   */
  protected function print_stream( $response, $bytes = 1024 ) {
    echo $response->getBody()->read($bytes);
  }

}