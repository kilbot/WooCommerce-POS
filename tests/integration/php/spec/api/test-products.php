<?php

class ProductsAPITest extends PHPUnit_Framework_TestCase {

  protected $client;

  /**
   *
   */
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

  /**
   * Helper functions
   */
  private function log_in_user(){
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce-pos-test/index.php',
      'woocommerce/woocommerce.php'
    ));
    update_option('woocommerce_pos_test_logged_in_user', 1);
  }

  private function log_out_user(){
    update_option('active_plugins', array(
      'woocommerce-pos/woocommerce-pos.php',
      'woocommerce/woocommerce.php'
    ));
    delete_option('woocommerce_pos_test_logged_in_user');
  }

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
  }

  /**
   *
   */
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

  /**
   *
   */
  public function test_get_single_simple_product() {
    $response = $this->client->get('99');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
  }

  /**
   *
   */
  public function test_simple_product_decimal_quantity(){
    $random_qty = rand(0, 999) / 100;

    // set the decimal_qty option
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('decimal_qty' => true) );

    // change the stock to decimal
    update_post_meta(99, '_manage_stock', 'yes');
    update_post_meta(99, '_stock', $random_qty);

    // update product and check response
    $response = $this->client->get('99');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( $random_qty, $data['product']['stock_quantity'] );
  }

  /**
   *
   */
  public function test_get_single_variable_product() {
    $response = $this->client->get('41');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( 'variation', $data['product']['type'] );
  }

  /**
   *
   */
  public function test_variable_product_decimal_quantity(){
    $random_qty = rand(0, 999) / 100;

    // set the decimal_qty option
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('decimal_qty' => true) );

    // change the stock to decimal
    update_post_meta(41, '_manage_stock', 'yes');
    update_post_meta(41, '_stock', $random_qty);

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
    $this->assertNotEmpty( $product );
    $this->assertEquals( $random_qty, $product['stock_quantity'] );
  }

  /**
   *
   */
  public function test_pos_only_products(){

    // activate POS Only products
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('pos_only_products' => true) );

    // get random product
    $response = $this->client->get();
    $data = $response->json();
    $product = $data['products'][ array_rand( $data['products'] ) ];

    // set to POS only
    update_post_meta($product['id'], '_pos_visibility', 'pos_only');

    // get product via API
    $response = $this->client->get($product['id']);
    $this->assertEquals(200, $response->getStatusCode());

    // get product via website
    $client = new GuzzleHttp\Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product['id']
      ),
      'exceptions' => false
    ));
    $this->assertEquals(404, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product['id'], '_pos_visibility');
  }

  /**
   * TODO: get_product in WC REST API does not trigger posts_where filter
   */
  public function test_online_only_products(){

    // activate POS Only products
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('pos_only_products' => true) );

    // get random product
    $response = $this->client->get();
    $data = $response->json();
    $product = $data['products'][ array_rand( $data['products'] ) ];

    // set to POS only
    update_post_meta($product['id'], '_pos_visibility', 'online_only');

    // get all product ids
    $this->log_in_user();
    $response = $this->client->get('', [
      'query' => [
        'filter[fields]' => 'id',
        'filter[limit]'=> '-1'
      ]
    ]);
    $this->log_out_user();
    $this->assertNotContains( $product['id'], $response->json() );

    // get single product via API
//    $response = $this->client->get($product['id']);
//    $data = $response->json();
//    $this->assertEmpty($data['product']);

    // get product via website
    $client = new GuzzleHttp\Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product['id']
      ),
      'exceptions' => false
    ));
    $this->assertEquals(200, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product['id'], '_pos_visibility');
  }

  /**
   *
   */
  public function test_barcode_filter(){
    $sku = 'SKU-12345';

    // update product sku
    update_post_meta(40, '_sku', $sku);
    update_post_meta(41, '_sku', 'foo');
    update_post_meta(42, '_sku', 'bar');

    // search for barcode
    $response = $this->client->get('', [
      'query' => [
        'filter[barcode]' => $sku
      ]
    ]);

    // should return one product
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);

    $product = $data['products'][0];
    $this->assertEquals(40, $product['id']);
    $this->assertEquals($sku, $product['barcode']);

    // variations should be present
    $this->assertCount(2, $product['variations']);

    // delete product sku
    delete_post_meta(40, '_sku');
    delete_post_meta(41, '_sku');
    delete_post_meta(42, '_sku');

  }

  /**
   *
   */
  public function test_partial_barcode_filter(){
    $sku = 'SKU-12345';

    // update product sku
    update_post_meta(40, '_sku', $sku);
    update_post_meta(41, '_sku', 'foo');
    update_post_meta(42, '_sku', 'bar');

    // search for barcode
    $response = $this->client->get('', [
      'query' => [
        'filter[barcode]' => '123'
      ]
    ]);

    // should return one product
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);

    $product = $data['products'][0];
    $this->assertEquals(40, $product['id']);
    $this->assertEquals($sku, $product['barcode']);

    // variations should be present
    $this->assertCount(2, $product['variations']);

    // delete product sku
    delete_post_meta(40, '_sku');
    delete_post_meta(41, '_sku');
    delete_post_meta(42, '_sku');

  }

  /**
   *
   */
  public function test_variation_barcode_filter(){
    $sku = 'SKU-12345';

    // update product sku
    update_post_meta(40, '_sku', 'foo');
    update_post_meta(41, '_sku', $sku);

    // search for barcode
    $response = $this->client->get('', [
      'query' => [
        'filter[barcode]' => $sku
      ]
    ]);

    // should return the parent product
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);

    $product = $data['products'][0];
    $this->assertEquals(40, $product['id']);

    // variations should be present
    $this->assertCount(2, $product['variations']);

    // update product sku
    delete_post_meta(40, '_sku');
    delete_post_meta(41, '_sku');

  }

}