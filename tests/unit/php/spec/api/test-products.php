<?php

class ProductsAPITest extends WP_UnitTestCase {

  private $products_api;
  private $product;

  private $sku = 'sku12345';

  function setUp(){
    $this->products_api = new WC_POS_API_Products( $this->mock_api_server() );

    // create product
    $this->product = wc_get_product( $this->mock_product() );
  }

  function mock_api_server(){
    $stub = $this->getMockBuilder('WC_API_Server')
      ->disableOriginalConstructor()
      ->getMock();

    return $stub;
  }

  function mock_product(){
    $product_id = $this->factory->post->create(
      array(
        'post_title' => 'Woo Product',
        'post_type' => 'product',
      )
    );
    add_post_meta( $product_id, '_sku', $this->sku, true );
    return $product_id;
  }

  function test_product_response(){
    $response = $this->products_api->product_response(array(), $this->product, null, null);
//    $this->assertEquals(0.25, $response['stock_quantity']);
    $this->assertEquals( $this->sku, $response['barcode'] );
    $this->assertEquals( wc_placeholder_img_src(), $response['featured_src'] );
  }

}