<?php

class ProductsAPITest extends PHPUnit_Framework_TestCase {

  protected $client;

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
  }

  public function test_simple_product_decimal_quantity(){
    $random_qty = rand(0, 999) / 100;

    // set the decimal_qty option
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('decimal_qty' => true) );

    // get single product
    $response = $this->client->get('99');
    $data = $response->json();
    $product = $data['product'];

    // change the stock to decimal
    $product['managing_stock'] = true;
    $product['stock_quantity'] = $random_qty;

    // update product and check response
    $response = $this->client->put('99', ['json' => $product ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( $random_qty, $data['product']['stock_quantity'] );
  }

  public function test_get_single_variable_product() {
    $response = $this->client->get('41');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( 'variation', $data['product']['type'] );
  }

  public function test_variable_product_decimal_quantity(){
    $random_qty = rand(0, 999) / 100;

    // set the decimal_qty option
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('decimal_qty' => true) );

    // get single variation
    $response = $this->client->get('41');
    $data = $response->json();
    $product = $data['product'];

    // change the stock to decimal
    $product['managing_stock'] = true;
    $product['stock_quantity'] = $random_qty;

    // update variation and check response
    $response = $this->client->put('41', ['json' => $product ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( $random_qty, $data['product']['stock_quantity'] );

    // also need to check the parent output
    $response = $this->client->get('40');
    $data = $response->json();
    $parent = $data['product'];
    $this->assertArrayHasKey('variations', $parent);
    $product = '';
    foreach( $parent['variations'] as $variation ){
      if( $variation['id'] == 41 ){
        $product = $variation;
        break;
      }
    }
    $this->assertEquals( $random_qty, $product['stock_quantity'] );
  }

}