<?php

class ProductsAPITest extends PHPUnit_Framework_TestCase {

  protected $client;
  public $product_99;

  public function setUp() {
    $this->client = new GuzzleHttp\Client([
      'base_url' => get_woocommerce_api_url( 'products/' ),
      'defaults' => [
        'exceptions' => false,
        'headers' => [ 'X-WC-POS' => '1' ]
      ]
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

  public function test_get_simple_products() {
    $response = $this->client->get('', [
      'query' => [
        'filter[type]' => 'simple',
        'filter[limit]'=> '1'
      ]
    ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);

    // simple product should have:
    // - featured_src
    // - barcode
    $product = $data['products'][0];
    $this->assertArrayHasKey('featured_src', $product);
    $this->assertArrayHasKey('barcode', $product);
  }

  public function test_get_single_simple_product() {
    $response = $this->client->get('99');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->product_99 = $data['product'];
  }

  public function test_simple_product_allow_decimal_quantity(){
    // set the decimal_qty option
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('decimal_qty' => true) );

    // get single product
    $response = $this->client->get('99');
    $data = $response->json();
    $product = $data['product'];

    // change the stock to decimal
    $product['managing_stock'] = true;
    $product['stock_quantity'] = 3.25;

    // update product and check response
    $response = $this->client->put('99', ['json' => json_encode( $product )]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( '3.25', $data['product']['stock_quantity'] );
  }

}