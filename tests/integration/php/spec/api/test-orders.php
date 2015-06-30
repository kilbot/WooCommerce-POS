<?php

class OrdersAPITest extends PHPUnit_Framework_TestCase {

  protected $client;

  public function setUp() {
    $this->client = new GuzzleHttp\Client([
      'base_url' => get_woocommerce_api_url( 'orders/' ),
      'defaults' => [
        'exceptions' => false,
        'headers' => [ 'X-WC-POS' => '1' ]
      ]
    ]);
  }

  /**
   * Helper functions
   * - filter_line_item: create line_item from raw product json
   * @param $product
   * @return
   */
  private function filter_line_item($product){
    // id must become product_id
    $product['product_id'] = $product['id'];
    unset($product['id']);

    // line_item must have a quantity
    if( !isset($product['quantity']) )
      $product['quantity'] = 1;

    // variations should be removed
    // - WC_API_Orders->set_line_item() does a check for 'variations', not sure why
    unset($product['variations']);

    return $product;
  }

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('orders', $data);
  }

  /**
   *
   */
  public function test_create_order(){
    $response = $this->client->post('', array(
      'json' => array()
    ));
    // 201 = created
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $order_id = $data['order']['id'];
    $this->assertEquals(1, get_post_meta( $order_id, '_pos', true ) );
  }

  /**
   *
   */
  public function test_edit_order(){
    // get last order
    $response = $this->client->get();
    $data = $response->json();
    $order_id = $data['orders'][0]['id'];

    // update note
    $response = $this->client->put($order_id, array(
      'json' => array(
        'note' => 'updated'
      )
    ));
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals('updated', $data['order']['note']);
  }

  /**
   *
   */
  public function test_order_with_product(){
    // get a product
    $response = $this->client->get( get_woocommerce_api_url( 'products/' ) );
    $data = $response->json();
    $product = $data['products'][ array_rand( $data['products'] ) ];

    // filter product
    $product = $this->filter_line_item($product);

    // create order
    $response = $this->client->post('', array(
      'json' => array(
        'line_items' => array(
          $product
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(1, $data['order']['total_line_items_quantity']);
  }

  /**
   * Test (int) stock adjustment
   * - note that payment must be complete to trigger the stock adjustment
   */
  public function test_integer_stock_adjustment(){
    // get a random product
    $response = $this->client->get( get_woocommerce_api_url( 'products/' ) );
    $data = $response->json();
    $product = $data['products'][ array_rand( $data['products'] ) ];

    // filter product
    $product = $this->filter_line_item($product);

    // inject stock value to db
    update_post_meta($product['product_id'], '_manage_stock', 'yes');
    update_post_meta($product['product_id'], '_stock', 3);

    // create order with payment details
    $response = $this->client->post('', array(
      'json' => array(
        'line_items' => array(
          $product
        ),
        'payment_details' => array(
          'method_id' => 'pos_cash',
          'method_title' => 'Test Cash Payment',
          'paid' => true
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(1, $data['order']['total_line_items_quantity']);
    $this->assertEquals(2, get_post_meta($product['product_id'], '_stock', true) );
  }

  /**
   * Test (float) stock adjustment
   * - note that payment must be complete to trigger the stock adjustment
   */
  public function test_float_stock_adjustment(){
    // two random floats
    $random_stock = rand(0, 999) / 100;
    $random_qty = rand(0, 999) / 100;

    // get a random product
    $response = $this->client->get( get_woocommerce_api_url( 'products/' ) );
    $data = $response->json();
    $product = $data['products'][ array_rand( $data['products'] ) ];

    // filter product and set quantity
    $product = $this->filter_line_item($product);
    $product['quantity'] = $random_qty;

    // set the decimal_qty option
    $option_key = WC_POS_Admin_Settings::DB_PREFIX . 'general';
    update_option( $option_key, array('decimal_qty' => true) );

    // inject stock value to db
    update_post_meta($product['product_id'], '_manage_stock', 'yes');
    update_post_meta($product['product_id'], '_stock', $random_stock);

    // create order with payment details
    $response = $this->client->post('', array(
      'json' => array(
        'line_items' => array(
          $product
        ),
        'payment_details' => array(
          'method_id' => 'pos_cash',
          'method_title' => 'Test Cash Payment',
          'paid' => true
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals($random_qty, $data['order']['total_line_items_quantity']);
    $this->assertEquals($random_stock - $random_qty, get_post_meta($product['product_id'], '_stock', true) );
  }

  

}