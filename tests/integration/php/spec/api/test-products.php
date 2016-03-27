<?php

namespace WC_POS\Integration_Tests\API;

use GuzzleHttp\Client;
use PHPUnit_Framework_TestCase;
use WC_POS\Admin\Settings;

class ProductsTest extends PHPUnit_Framework_TestCase {

  protected $client;

  /**
   *
   */
  public function setUp() {
    $this->client = new Client([
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
   * @return mixed
   */
  private function get_random_product_id() {
    $response = $this->client->get(get_woocommerce_api_url( 'products/ids' ));
    $data = $response->json();
    $key = array_rand( $data['products'] );
    return $data['products'][$key]['id'];
  }

  /**
   * @param int $length
   * @return string
   */
  private function generate_random_string($length=10) {
    $string = '';
    $characters = "ABCDEFHJKLMNPRTVWXYZabcdefghijklmnopqrstuvwxyz";
    for ($p = 0; $p < $length; $p++) {
      $string .= $characters[mt_rand(0, strlen($characters)-1)];
    }
    return $string;
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
    $option_key = Settings::DB_PREFIX . 'general';
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
    $option_key = Settings::DB_PREFIX . 'general';
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
    $option_key = Settings::DB_PREFIX . 'general';
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
    $client = new Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product['id']
      ),
      'exceptions' => false
    ));
    $this->assertEquals(404, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product['id'], '_pos_visibility');
    update_option( $option_key, array('pos_only_products' => false) );

  }

  /**
   *
   */
  public function test_online_only_products(){

    // activate POS Only products
    $option_key = Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('pos_only_products' => true) );

    // get random product
    $product_id = $this->get_random_product_id();

    // set to POS only
    update_post_meta($product_id, '_pos_visibility', 'online_only');

    // get all product ids
    $response = $this->client->get(get_woocommerce_api_url( 'products/ids' ));
    $data = $response->json();
    $this->assertGreaterThan(10, count($data['products']));
    $ids = wp_list_pluck( $data['products'], 'id' );
    $this->assertNotContains( $product_id, $ids );

    // get product via website
    $client = new Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product_id
      ),
      'exceptions' => false
    ));
    $this->assertEquals(200, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product_id, '_pos_visibility');
    update_option( $option_key, array('pos_only_products' => false) );

  }

  /**
   *
   */
//  public function test_barcode_filter(){
//    $sku = 'SKU-12345';
//
//    // update product sku
//    update_post_meta(40, '_sku', $sku);
//    update_post_meta(41, '_sku', 'foo');
//    update_post_meta(42, '_sku', 'bar');
//
//    // search for barcode
//    $response = $this->client->get('', [
//      'query' => [
//        'filter[barcode]' => $sku
//      ]
//    ]);
//
//    // should return one product
//    $this->assertEquals(200, $response->getStatusCode());
//    $data = $response->json();
//    $this->assertArrayHasKey('products', $data);
//    $this->assertCount(1, $data['products']);
//
//    $product = $data['products'][0];
//    $this->assertEquals(40, $product['id']);
//    $this->assertEquals($sku, $product['barcode']);
//
//    // variations should be present
//    $this->assertCount(2, $product['variations']);
//
//    // delete product sku
//    delete_post_meta(40, '_sku');
//    delete_post_meta(41, '_sku');
//    delete_post_meta(42, '_sku');
//
//  }
//
//  /**
//   *
//   */
//  public function test_partial_barcode_filter(){
//    $sku = 'SKU-12345';
//
//    // update product sku
//    update_post_meta(40, '_sku', $sku);
//    update_post_meta(41, '_sku', 'foo');
//    update_post_meta(42, '_sku', 'bar');
//
//    // search for barcode
//    $response = $this->client->get('', [
//      'query' => [
//        'filter[barcode]' => '123'
//      ]
//    ]);
//
//    // should return one product
//    $this->assertEquals(200, $response->getStatusCode());
//    $data = $response->json();
//    $this->assertArrayHasKey('products', $data);
//    $this->assertCount(1, $data['products']);
//
//    $product = $data['products'][0];
//    $this->assertEquals(40, $product['id']);
//    $this->assertEquals($sku, $product['barcode']);
//
//    // variations should be present
//    $this->assertCount(2, $product['variations']);
//
//    // delete product sku
//    delete_post_meta(40, '_sku');
//    delete_post_meta(41, '_sku');
//    delete_post_meta(42, '_sku');
//
//  }
//
//  /**
//   *
//   */
//  public function test_variation_barcode_filter(){
//    $sku = 'SKU-12345';
//
//    // update product sku
//    update_post_meta(40, '_sku', 'foo');
//    update_post_meta(41, '_sku', $sku);
//
//    // search for barcode
//    $response = $this->client->get('', [
//      'query' => [
//        'filter[barcode]' => $sku
//      ]
//    ]);
//
//    // should return the parent product
//    $this->assertEquals(200, $response->getStatusCode());
//    $data = $response->json();
//    $this->assertArrayHasKey('products', $data);
//    $this->assertCount(1, $data['products']);
//
//    $product = $data['products'][0];
//    $this->assertEquals(40, $product['id']);
//
//    // variations should be present
//    $this->assertCount(2, $product['variations']);
//
//    // update product sku
//    delete_post_meta(40, '_sku');
//    delete_post_meta(41, '_sku');
//
//  }

  /**
   *
   */
  public function test_title_search(){
    $response = $this->client->get('', [
      'query' => array(
        'filter[q]' => 'prem'
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(2, $data['products']);

    $this->assertEquals('Premium Quality', $data['products'][0]['title']);
    $this->assertEquals('Premium Quality', $data['products'][1]['title']);
  }

  /**
   *
   */
  public function test_featured_search(){
    
    global $wpdb;
    $wpdb->update($wpdb->postmeta, array('meta_value' => 'no'), array('meta_key' => '_featured'));

    $response = $this->client->get('', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'featured',
            'query'   => 'true'
          )
        )
      )
    ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(0, $data['products']);

    // add _featured
    $product_id = $this->get_random_product_id();
    update_post_meta($product_id, '_featured', 'yes');

    $response = $this->client->get('', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'featured',
            'query'   => 'true'
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);

    $this->assertEquals($product_id, $data['products'][0]['id']);

    // remove _featured
    update_post_meta($product_id, '_featured', 'no');

  }

  public function test_sku_search(){
    $sku = $this->generate_random_string();
    $product_id = $this->get_random_product_id();
    update_post_meta($product_id, '_sku', $sku);

    $response = $this->client->get('', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'sku',
            'query'   => substr($sku, 0, 6)
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);
    $this->assertEquals($product_id, $data['products'][0]['id']);
    $this->assertEquals($sku, $data['products'][0]['sku']);
    $this->assertEquals($sku, $data['products'][0]['barcode']);

    delete_post_meta($product_id, '_sku');

  }

  public function test_barcode_search(){
    $barcode = $this->generate_random_string();
    $product_id = $this->get_random_product_id();
    update_post_meta($product_id, '_sku', $barcode);

// todo: why doesn't this work?
//    add_filter('woocommerce_pos_barcode_meta_key', function(){
//      return '_barcode';
//    });

    $response = $this->client->get('', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'barcode',
            'query'   => substr($barcode, 0, 6)
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);
    $this->assertEquals($product_id, $data['products'][0]['id']);
    $this->assertEquals($barcode, $data['products'][0]['barcode']);

    delete_post_meta($product_id, '_sku');

  }

  public function test_on_sale_search() {

    // on_sale = true
    $response = $this->client->get('', [
      'query' => array(
        'limit' => -1,
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'on_sale',
            'query'   => 'true'
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertGreaterThan(1, count($data['products']));

    $on_sale = wp_list_pluck( $data['products'], 'on_sale' );
    $this->assertEquals([true], array_unique($on_sale));

    // on_sale = false
    $response = $this->client->get('', [
      'query' => array(
        'limit' => -1,
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'on_sale',
            'query'   => 'false'
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertGreaterThan(1, count($data['products']));

    $on_sale = wp_list_pluck( $data['products'], 'on_sale' );
    $this->assertEquals([false], array_unique($on_sale));

  }

  public function test_categories_search() {
    $response = $this->client->get('', [
      'query' => array(
        'limit' => -1,
        'filter[category]' => 'music'
      )
    ]);
    $music_category = $response->json();

    $response = $this->client->get('', [
      'query' => array(
        'limit' => -1,
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'categories',
            'query'   => 'Music'
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);

    $this->assertEquals($music_category, $data);
  }

  public function test_cat_search() {
    $response = $this->client->get('', [
      'query' => array(
        'limit' => -1,
        'filter[category]' => 't-shirts'
      )
    ]);
    $music_category = $response->json();

    $response = $this->client->get('', [
      'query' => array(
        'limit' => -1,
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'cat',
            'query'   => 'T-Shirts'
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);

    $this->assertEquals($music_category, $data);
  }

}