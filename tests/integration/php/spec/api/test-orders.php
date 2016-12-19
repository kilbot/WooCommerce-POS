<?php

namespace WC_POS\Integration_Tests\API;

use WC_POS\Admin\Settings;
use WC_POS\Framework\TestCase;

class OrdersTest extends TestCase {

  /**
   * Helper functions
   * - filter_line_item: create line_item from raw product json
   * - import dummy tax data
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

  private function update_tax_settings($args = array()){
    $args = wp_parse_args($args, array(
      'calc_taxes' => 'yes',
      'prices_include_tax' => 'no',
      'tax_based_on' => 'base',
      'default_country' => 'GB'
    ));

    // enable taxes
    update_option('woocommerce_calc_taxes', $args['calc_taxes']);
    update_option('woocommerce_prices_include_tax', $args['prices_include_tax']);
    update_option('woocommerce_tax_based_on', $args['tax_based_on']);
    update_option('woocommerce_default_country', $args['default_country']);
    // may need to delete _transient_wc_tax_rates_
  }

  /**
   *
   */
  public function test_get_valid_response() {
    $response = $this->client->get('orders');
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('orders', $data);
  }

  /**
   *
   */
  public function test_create_order(){
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array()
      )
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
    $response = $this->client->get('orders');
    $data = $response->json();
    $order_id = $data['orders'][0]['id'];

    // update note
    $response = $this->client->put('orders/' . $order_id, array(
      'json' => array(
        'order' => array(
          'note' => 'updated'
        )
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
  public function test_create_order_with_product(){
    // get a random product
    $product = $this->get_random_product();

    // filter product
    $product = $this->filter_line_item($product);

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(1, $data['order']['total_line_items_quantity']);
  }

  /**
   *
   */
//  public function test_edit_order_with_product(){
//    // get a random product
//    $product = $this->get_random_product();
//
//    // filter product
//    $product = $this->filter_line_item($product);
//
//    // create order
//    $response = $this->client->post('', array(
//      'json' => array(
//        'status' => 'CREATE_FAILED',
//        'line_items' => array(
//          $product
//        )
//      )
//    ));
//    $this->assertEquals(201, $response->getStatusCode());
//
//    // now edit order
//    $response = $this->client->post('', array(
//      'json' => array(
//        'status' => 'CREATE_FAILED',
//        'line_items' => array(
//          $product
//        )
//      )
//    ));
//
//    $this->assertEquals(201, $response->getStatusCode());
//    $data = $response->json();
//    $this->assertArrayHasKey('order', $data);
//    $this->assertEquals(1, $data['order']['total_line_items_quantity']);
//  }

  /**
   * Test (int) stock adjustment
   * - note that payment must be complete to trigger the stock adjustment
   */
  public function test_integer_stock_adjustment(){
    // get a random product
    $product = $this->get_random_product();

    // filter product
    $product = $this->filter_line_item($product);

    // inject stock value to db
    update_post_meta($product['product_id'], '_manage_stock', 'yes');
    update_post_meta($product['product_id'], '_stock', 3);

    // create order with payment details
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          ),
          'payment_details' => array(
            'method_id' => 'pos_cash',
            'method_title' => 'Test Cash Payment',
            'paid' => true
          )
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
    $product = $this->get_random_product();

    // filter product and set quantity
    $product = $this->filter_line_item($product);
    $product['quantity'] = $random_qty;

    // set the decimal_qty option
    $option_key = Settings::DB_PREFIX . 'products';
    update_option( $option_key, array('decimal_qty' => true) );

    // inject stock value to db
    update_post_meta($product['product_id'], '_manage_stock', 'yes');
    update_post_meta($product['product_id'], '_stock', $random_stock);

    // create order with payment details
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          ),
          'payment_details' => array(
            'method_id' => 'pos_cash',
            'method_title' => 'Test Cash Payment',
            'paid' => true
          )
        )
      )
    ));

    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals($random_qty, $data['order']['total_line_items_quantity']);
    $this->assertEquals($random_stock - $random_qty, get_post_meta($product['product_id'], '_stock', true) );
  }

  /**
   * Test changing regular_price and price
   */
  public function test_line_item_discount(){
    // two random floats
    $regular_price = rand(0, 999) / 100;
    $price = rand(0, 999) / 100;

    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    // set subtotal and total
    $product['subtotal'] = $regular_price;
    $product['total'] = $price;

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals($regular_price - $price, $data['order']['total_discount']);

  }

  /**
   * Test changing product title
   */
  public function test_line_item_change_title(){
    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    $product['title'] = 'Foo';

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          )
        ),
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);

    // note: product goes in as 'title', comes out as 'name'
    $this->assertEquals('Foo', $data['order']['line_items'][0]['name']);
  }

  /**
   *
   */
  public function test_line_item_exclusive_tax(){
    // enable taxes
    $this->update_tax_settings();

    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    $product['taxable'] = true;
    $product['total'] = 10;
    $product['total_tax'] = 2;

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(2, $data['order']['total_tax']);
  }

  /**
   *
   */
  public function test_line_item_change_taxable(){
    // enable taxes
    $this->update_tax_settings();

    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    $product['taxable'] = false;
    $product['total'] = 10;
    $product['total_tax'] = 2;

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(0, $data['order']['total_tax']);
  }

  /**
   *
   */
  public function test_line_item_change_tax_rate(){
    // enable taxes
    $this->update_tax_settings();

    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    $product['taxable'] = true;
    $product['total'] = 10;
    $product['total_tax'] = 0.5;
    $product['tax_class'] = 'reduced-rate';

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(0.5, $data['order']['total_tax']);
    $this->assertEquals('reduced-rate', $data['order']['line_items'][0]['tax_class']);
  }

  /**
   *
   */
  public function test_order_with_fee(){

    // construct fee
    // - fee title is required
    $fee = array(
      'title' => 'Foo',
      'total' => 10
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'fee_lines' => array(
            $fee
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(10, $data['order']['total']);
    $this->assertEquals('Foo', $data['order']['fee_lines'][0]['title']);
  }

  /**
   *
   */
  public function test_order_with_taxable_fee(){
    // enable taxes
    $this->update_tax_settings();

    // construct fee
    // - fee title is required
    // - tax_class is required if taxable
    $fee = array(
      'title'     => 'Foo',
      'total'     => 10,
      'taxable'   => true,
      'tax_class' => ''
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'fee_lines' => array(
            $fee
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(12, $data['order']['total']);
    $this->assertEquals(2, $data['order']['total_tax']);
  }

  /**
   *
   */
  public function test_order_with_taxable_fee_change_tax_class(){
    // enable taxes
    $this->update_tax_settings();

    // construct fee
    // - fee title is required
    // - tax_class is required if taxable
    $fee = array(
      'title'     => 'Foo',
      'total'     => 10,
      'taxable'   => true,
      'tax_class' => 'reduced-rate'
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'fee_lines' => array(
            $fee
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(10.5, $data['order']['total']);
    $this->assertEquals(0.5, $data['order']['total_tax']);
  }

  /**
   *
   */
  public function test_order_with_negative_fee(){

    // construct fee
    // - fee title is required
    $fee = array(
      'title'     => 'Foo',
      'total'     => -10,
      'taxable'   => false
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'fee_lines' => array(
            $fee
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(-10, $data['order']['total']);
  }

  /**
   *
   */
  public function test_order_with_negative_fee_and_tax(){
    // enable taxes
    $this->update_tax_settings();

    // construct fee
    // - fee title is required
    $fee = array(
      'title'     => 'Foo',
      'total'     => -10,
      'taxable'   => true,
      'tax_class' => '',
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'fee_lines' => array(
            $fee
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(-12, $data['order']['total']);
    $this->assertEquals(-2, $data['order']['total_tax']);
  }

  /**
   * https://github.com/kilbot/WooCommerce-POS/issues/85
   */
  public function test_order_with_product_and_negative_fee(){
    // enable taxes
    $this->update_tax_settings();

    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    $product['taxable'] = true;
    $product['total'] = 10;
    $product['total_tax'] = 2;
    $product['tax_class'] = '';

    // construct fee
    // - fee title is required
    $fee = array(
      'title'     => 'Foo',
      'total'     => -5,
      'taxable'   => false
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          ),
          'fee_lines' => array(
            $fee
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(7, $data['order']['total']);
    $this->assertEquals(2, $data['order']['total_tax']);
  }

  /**
   *
   */
  public function test_order_with_shipping(){

    // construct shipping
    // - method_id is required
    // - method_title is required
    $shipping = array(
      'method_id' => 'foo',
      'method_title' => 'Bar',
      'total'     => 10,
      'taxable'   => false,
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'shipping_lines' => array(
            $shipping
          )
        )
      )
    ));

    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(10, $data['order']['total_shipping']);
    $this->assertEquals('Bar', $data['order']['shipping_methods']);

  }

  /**
   *
   */
  public function test_order_with_shipping_change_taxable(){
    // enable taxes
    $this->update_tax_settings();

    // construct shipping
    // - method_id is required
    // - method_title is required
    $shipping = array(
      'method_id' => 'foo',
      'method_title' => 'Bar',
      'total'     => 10,
      'taxable'   => true,
      ''
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'shipping_lines' => array(
            $shipping
          ),
          // note: shipping_tax required
          'shipping_tax' => 2
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(10, $data['order']['total_shipping']);
    $this->assertEquals(2, $data['order']['shipping_tax']);
    $this->assertEquals(12, $data['order']['total']);
    $this->assertEquals(2, $data['order']['total_tax']);

  }

  /**
   *
   */
  public function test_order_with_shipping_change_tax_class(){
    // enable taxes
    $this->update_tax_settings();

    // construct shipping
    // - method_id is required
    // - method_title is required
    $shipping = array(
      'method_id' => 'foo',
      'method_title' => 'Bar',
      'total'     => 10,
      'taxable'   => true,
      'tax_class' => 'reduced-rate'
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'shipping_lines' => array(
            $shipping
          ),
          // note: shipping_tax required
          'shipping_tax' => 0.5
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(10, $data['order']['total_shipping']);
    $this->assertEquals(0.5, $data['order']['shipping_tax']);
    $this->assertEquals(10.5, $data['order']['total']);
    $this->assertEquals(0.5, $data['order']['total_tax']);

  }

  /**
   *
   */
  public function test_order_with_pos_taxes(){
    $taxes = array(
      'all' => true
    );

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'pos_taxes' => $taxes
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals($taxes, $data['order']['pos_taxes']);
  }

  /**
   * @group debug
   */
  public function test_order_calculation_with_pos_taxes_disabled(){

    // enable taxes
    $this->update_tax_settings();

    // get a random product
    $product = $this->get_random_product();
    $product = $this->filter_line_item($product);

    $product['taxable'] = true;
    $product['total'] = 10;
    $product['total_tax'] = 0;

    // create order
    $response = $this->client->post('orders', array(
      'json' => array(
        'order' => array(
          'line_items' => array(
            $product
          ),
          'pos_taxes' => array(
            'all' => false
          )
        )
      )
    ));
    $this->assertEquals(201, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('order', $data);
    $this->assertEquals(0, $data['order']['total_tax']);

  }

}