<?php

namespace WC_POS\Integration_Tests\API;

use WC_POS\Admin\Settings;
use WC_POS\Framework\TestCase;
use GuzzleHttp\Client;

class ProductsTest extends TestCase {

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get('products');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
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
    $response = $this->client->get('products/99');
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
    $option_key = Settings::DB_PREFIX . 'products';
    update_option( $option_key, array('decimal_qty' => true) );

    // change the stock to decimal
    update_post_meta(99, '_manage_stock', 'yes');
    update_post_meta(99, '_stock', $random_qty);

    // update product and check response
    $response = $this->client->get('products/99');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('product', $data);
    $this->assertEquals( $random_qty, $data['product']['stock_quantity'] );
  }

  /**
   *
   */
  public function test_get_single_variable_product() {
    $response = $this->client->get('products/41');
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
    $option_key = Settings::DB_PREFIX . 'products';
    update_option( $option_key, array('decimal_qty' => true) );

    // change the stock to decimal
    update_post_meta(41, '_manage_stock', 'yes');
    update_post_meta(41, '_stock', $random_qty);

    // also need to check the parent output
    $response = $this->client->get('products/40');
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
    $option_key = Settings::DB_PREFIX . 'products';
    update_option( $option_key, array('pos_only_products' => true) );

    // get random product
    $product_id = $this->get_random_product_id();

    // set to POS only
    update_post_meta($product_id, '_pos_visibility', 'pos_only');

    // get product via API
    $response = $this->client->get('products/' . $product_id);
    $this->assertEquals(200, $response->getStatusCode());

    // get product via website
    $client = new Client();
    $response = $client->get( get_home_url(), array(
      'query' => array(
        'p' => $product_id
      ),
      'exceptions' => false
    ));
    $this->assertEquals(404, $response->getStatusCode());

    // delete POS visibility setting
    delete_post_meta($product_id, '_pos_visibility');
    delete_option( $option_key );

  }

  /**
   *
   */
  public function test_online_only_products(){

    // activate POS Only products
    $option_key = Settings::DB_PREFIX . 'products';
    update_option( $option_key, array('pos_only_products' => true) );

    // get random product
    $product_id = $this->get_random_product_id();

    // set to POS only
    update_post_meta($product_id, '_pos_visibility', 'online_only');

    // get all product ids
    $response = $this->client->get('products/ids');
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
    delete_option( $option_key );

  }

  /**
   *
   */
  public function test_title_search(){
    $response = $this->client->get('products', [
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

    $response = $this->client->get('products', [
      'query' => array(
        'filter[q]' => 'libero',
        'filter[fields]' => 'title'
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(0, $data['products']);

  }

  /**
   * 
   */
  public function test_id_search(){
    $product_id = $this->get_random_product_id();

    $response = $this->client->get('products', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'id',
            'query'   => $product_id
          )
        )
      )
    ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(1, $data['products']);
    $this->assertEquals($product_id, $data['products'][0]['id']);

  }

  /**
   *
   */
  public function test_id_not_in_search(){
    $product_id = $this->get_random_product_id();

    $response = $this->client->get('products', [
      'query' => array(
        'filter[not_in]' => $product_id,
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'id',
            'query'   => $product_id
          )
        )
      )
    ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(0, $data['products']);

  }

  /**
   *
   */
  public function test_featured_search(){
    
    global $wpdb;

    // store downloadable ids
    $featured = $wpdb->get_col("
      SELECT post_id 
      FROM $wpdb->postmeta 
      WHERE meta_key = '_featured' 
      AND meta_value = 'yes'
    ");

    $wpdb->update($wpdb->postmeta, array('meta_value' => 'no'), array('meta_key' => '_featured'));

    $response = $this->client->get('products', [
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

    $response = $this->client->get('products', [
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

    // restore downloadable
    foreach($featured as $id){
      $wpdb->update($wpdb->postmeta, array('meta_value' => 'yes'), array('post_id' => $id,'meta_key' => '_featured'));
    }
  }

  /**
   *
   */
  public function test_downloadable_search(){

    global $wpdb;

    // store downloadable ids
    $downloadable = $wpdb->get_col("
      SELECT post_id 
      FROM $wpdb->postmeta 
      WHERE meta_key = '_downloadable' 
      AND meta_value = 'yes'
    ");

    // set all to 'no'
    $wpdb->update($wpdb->postmeta, array('meta_value' => 'no'), array('meta_key' => '_downloadable'));

    $response = $this->client->get('products', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'downloadable',
            'query'   => 'true'
          )
        )
      )
    ]);
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertCount(0, $data['products']);

    // add _downloadable
    $product_id = $this->get_random_product_id();
    update_post_meta($product_id, '_downloadable', 'yes');

    $response = $this->client->get('products', [
      'query' => array(
        'filter[q]' => array(
          array(
            'type'    => 'prefix',
            'prefix'  => 'downloadable',
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

    // remove _downloadable
    update_post_meta($product_id, '_downloadable', 'no');

    // restore downloadable
    foreach($downloadable as $id){
      $wpdb->update($wpdb->postmeta, array('meta_value' => 'yes'), array('post_id' => $id,'meta_key' => '_downloadable'));
    }
  }

  /**
   *
   */
  public function test_sku_search(){
    $sku = $this->generate_random_string();
    $product_id = $this->get_random_product_id();
    update_post_meta($product_id, '_sku', $sku);

    $response = $this->client->get('products', [
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

  /**
   *
   */
  public function test_barcode_search(){
    $barcode = $this->generate_random_string();
    $product_id = $this->get_random_product_id();
    update_post_meta($product_id, '_sku', $barcode);

// todo: why doesn't this work? different lifecycle?
//    add_filter('woocommerce_pos_barcode_meta_key', function(){
//      return '_barcode';
//    });

    $response = $this->client->get('products', [
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

  /**
   *
   */
  public function test_on_sale_search() {
    $on_sale_products = array();
    $on_sale_products_and_variations = wc_get_product_ids_on_sale();

    // scrub variations
    foreach($on_sale_products_and_variations as $id){
      $product = wc_get_product( $id );
      if( !$product->is_type('variation') ){
        $on_sale_products[] = $id;
      }
    }

    // not_in 2 products
    $not_in_keys = array_rand($on_sale_products, 2);
    $not_in = array();
    foreach($not_in_keys as $key){
      $not_in[] = $on_sale_products[$key];
      unset($on_sale_products[$key]);
    }

    // on_sale = true
    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'not_in' => implode(',', $not_in),
          'q' => array(
            array(
              'type'    => 'prefix',
              'prefix'  => 'on_sale',
              'query'   => 'true'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $on_sale_response = array_keys( wp_list_pluck( $data['products'], 'on_sale', 'id' ) );
    $this->assertEquals( count($on_sale_products), count($on_sale_response) );

    $diff = array_diff( $on_sale_products, $on_sale_response );
    $this->assertEmpty( $diff, json_encode($diff) );

    // get all product ids
    $response = $this->client->get('products', [
      'query' => array(
        'filter[limit]' => -1
      )
    ]);
    $data = $response->json();
    $all_products = wp_list_pluck( $data['products'], 'id' );

    $not_on_sale_products = array_diff( $all_products, wc_get_product_ids_on_sale() );

    // on_sale = false
    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type'    => 'prefix',
              'prefix'  => 'on_sale',
              'query'   => 'false'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $not_on_sale_response = wp_list_pluck( $data['products'], 'id' );
    $this->assertEquals( count($not_on_sale_products), count($not_on_sale_response) );

    $diff = array_diff( $not_on_sale_products, $not_on_sale_response );
    $this->assertEmpty( $diff, json_encode($diff) );

  }

  /**
   *
   */
  public function test_categories_search() {
    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'category' => 'music'
        )
      )
    ]);
    $music_category = $response->json();

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type'    => 'prefix',
              'prefix'  => 'categories',
              'query'   => 'Music'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);

    $this->assertEquals($music_category, $data);
  }

  /**
   *
   */
  public function test_cat_search() {
    // update to a two word category
    $term = get_term_by('slug', 'posters', 'product_cat');
    wp_update_term($term->term_id, 'product_cat', array('name' => 'Woo Posters'));

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'category' => 'posters'
        )
      )
    ]);
    $music_category = $response->json();

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type'    => 'prefix',
              'prefix'  => 'cat',
              'query'   => 'woo posters'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);

    $this->assertEquals($music_category, $data);
    wp_update_term($term->term_id, 'product_cat', array('name' => 'Posters'));

  }

  /**
   *
   */
  public function test_tag_search() {
    $tag = $this->generate_random_string();
    $term = wp_insert_term($tag, 'product_tag');
    $product_id = $this->get_random_product_id();
    wp_set_object_terms( $product_id, $tag, 'product_tag' );


    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'tag' => $tag
        )
      )
    ]);
    $tagged_product = $response->json();

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type'    => 'prefix',
              'prefix'  => 'tag',
              'query'   => $tag
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertEquals($tagged_product, $data);

    wp_remove_object_terms( $product_id, $tag, 'product_tag' );
    wp_delete_term( $term['term_id'], 'product_tag' );
  }

  /**
   *
   */
  public function test_title_and_cat_search(){
    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'category' => 'posters',
          'q' => 'ninja'
        )
      )
    ]);
    $ninja_posters = $response->json();

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type'    => 'prefix',
              'prefix'  => 'cat',
              'query'   => 'posters'
            ),
            array(
              'type'    => 'string',
              'query'   => 'ninja'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $this->assertEquals($ninja_posters, $data);

  }

  /**
   *
   */
  public function test_title_and_title_search() {
    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => 'woo ninja'
        )
      )
    ]);
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $target_ids = wp_list_pluck( $data['products'], 'id' );
    $rand_key = array_rand($target_ids, 1);
    $not_in = $target_ids[$rand_key];
    unset($target_ids[$rand_key]);

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'not_in' => $not_in,
          'q' => array(
            array(
              'type'    => 'string',
              'query'   => 'woo'
            ),
            array(
              'type'    => 'string',
              'query'   => 'ninja'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $result_ids = wp_list_pluck( $data['products'], 'id' );
    $this->assertEquals(array_values($target_ids), $result_ids);
  }

  /**
   *
   */
  public function test_prefix_and_title_search() {
    $response = $this->client->get( 'products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type' => 'string',
              'query' => 'woo'
            ),
            array(
              'type' => 'prefix',
              'prefix' => 'on_sale',
              'query' => 'true'
            )
          )
        )
      )
    ] );

    $this->assertEquals( 200, $response->getStatusCode() );
    $data = $response->json();
    $this->assertArrayHasKey( 'products', $data );
    $this->assertCount(2, $data['products']);

    $response = $this->client->get( 'products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => array(
            array(
              'type' => 'string',
              'query' => 'woo'
            ),
            array(
              'type' => 'string',
              'query' => 'ninja'
            ),
            array(
              'type' => 'prefix',
              'prefix' => 'on_sale',
              'query' => 'false'
            )
          )
        )
      )
    ] );

    $this->assertEquals( 200, $response->getStatusCode() );
    $data = $response->json();
    $this->assertArrayHasKey( 'products', $data );
    $this->assertCount(3, $data['products']);

  }

  /**
   *
   */
  public function test_title_and_title_and_all_not_in_search() {
    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => -1,
          'q' => 'ship you'
        )
      )
    ]);
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $target_ids = wp_list_pluck( $data['products'], 'id' );

    $response = $this->client->get('products', [
      'query' => array(
        'filter' => array(
          'limit' => 10,
          'not_in' => implode(',', $target_ids),
          'q' => array(
            array(
              'type'    => 'string',
              'query'   => 'ship'
            ),
            array(
              'type'    => 'string',
              'query'   => 'you'
            )
          )
        )
      )
    ]);

    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('products', $data);
    $result_ids = wp_list_pluck( $data['products'], 'id' );
    $this->assertEquals(array(), $result_ids); //
  }

}