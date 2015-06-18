<?php

class ProductsAPITest extends WP_UnitTestCase {

  private $products_api;

  function setUp(){
    $this->products_api = new WC_POS_API_Products();
  }

  function mock_simple_product(){
    $product = $this->getMockBuilder('WC_Product_Simple')
      ->disableOriginalConstructor()
      ->getMock();

    // $product->get_stock_quantity() = 0.25
    $product->method('get_stock_quantity')
      ->willReturn(0.25);

    return $product;
  }

  function test_product_response(){
    $data = array('id' => 1, 'sku' => 'sku12345');
    $product = $this->mock_simple_product();
    $response = $this->products_api->product_response($data, $product, null, null);
    $this->assertEquals(0.25, $response['stock_quantity']);
    $this->assertEquals('sku12345', $response['barcode']);
    $this->assertEquals( wc_placeholder_img_src(), $response['featured_src']);
  }

}