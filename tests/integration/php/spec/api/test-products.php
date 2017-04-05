<?php

class ProductsAPITest extends TestCase {

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get('products');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['products']) ? $data['products'] : $data;
    $this->assertCount(10, $data);
  }

  /**
   *
   */
  public function test_get_simple_products() {
    $response = $this->client->get('products', [
      'query' => [
        'filter[type]' => 'simple',
        'filter[limit]'=> '1'
      ]
    ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['products']) ? $data['products'] : $data;
    $this->assertCount(1, $data);

    // simple product should have:
    // - featured_src
    // - barcode
    $this->assertArrayHasKey('featured_src', $data[0]);
    $this->assertArrayHasKey('barcode', $data[0]);
  }

  /**
   *
   */
  public function test_get_single_simple_product() {
    $response = $this->client->get('products/99');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['product']) ? $data['product'] : $data;
    $this->assertEquals('99', $data['id']);
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
    $response = $this->client->get('products/99');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['product']) ? $data['product'] : $data;
    $this->assertEquals( $random_qty, $data['stock_quantity'] );
  }

  /**
   *
   */
  public function test_get_single_variable_product() {
    $response = $this->client->get('products/41');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['product']) ? $data['product'] : $data;
    $this->assertEquals( 'variation', $data['type'] );
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
    $response = $this->client->get('products/40');
    $data = $response->json();
    $data = isset($data['product']) ? $data['product'] : $data;
    $this->assertArrayHasKey('variations', $data);
    $product = '';
    foreach( $data['variations'] as $variation ){
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
    $product_id = $this->get_random_product_id();

    // set to POS only
    update_post_meta($product_id, '_pos_visibility', 'pos_only');

    // get product via API
    $response = $this->client->get('products/' . $product_id);
    $this->assertEquals(200, $response->getStatusCode());

    // get product via website
    $client = new GuzzleHttp\Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product_id
      ),
      'exceptions' => false
    ));
    $this->assertEquals(404, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product_id, '_pos_visibility');
  }

  /**
   * TODO: get_product in WC REST API does not trigger posts_where filter
   *
   *
   */
  public function test_online_only_products(){

    // activate POS Only products
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('pos_only_products' => true) );

    // get random product
    $product_id = $this->get_random_product_id();

    // set to POS only
    update_post_meta($product_id, '_pos_visibility', 'online_only');

    // get all product ids
    $this->login();
    $response = $this->client->get( admin_url('admin-ajax.php'), array(
      'query' => array(
        'action' => 'wc_pos_get_all_ids',
        'type' => 'products',
        'security' => wp_create_nonce( WC_POS_PLUGIN_NAME )
      ),
      'headers' => array( 'X-WC-POS' => '1' ),
      'exceptions' => false
    ));
    $this->logout();
    $this->assertNotContains( $product_id, $response->json() );

    // get single product via API
//    $response = $this->client->get($product['id']);
//    $data = $response->json();
//    $this->assertEmpty($data['product']);

    // get product via website
    $client = new GuzzleHttp\Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product_id
      ),
      'exceptions' => false
    ));
    $this->assertEquals(200, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product_id, '_pos_visibility');
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
    $response = $this->client->get('products', [
      'query' => [
        'filter[barcode]' => $sku
      ]
    ]);

    // should return one product
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['products']) ? $data['products'] : $data;
    $this->assertCount(1, $data);

    $product = $data[0];
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
    $response = $this->client->get('products', [
      'query' => [
        'filter[barcode]' => '123'
      ]
    ]);

    // should return one product
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['products']) ? $data['products'] : $data;
    $this->assertCount(1, $data);

    $product = $data[0];
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
    $response = $this->client->get('products', [
      'query' => [
        'filter[barcode]' => $sku
      ]
    ]);

    // should return the parent product
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $data = isset($data['products']) ? $data['products'] : $data;
    $this->assertCount(1, $data);

    $product = $data[0];
    $this->assertEquals(40, $product['id']);

    // variations should be present
    $this->assertCount(2, $product['variations']);

    // update product sku
    delete_post_meta(40, '_sku');
    delete_post_meta(41, '_sku');

  }

}