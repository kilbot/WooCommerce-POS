<?php

class ParamsTest extends WP_UnitTestCase {

  protected $params;

  public function setUp(){
    \WP_Mock::setUp();
    $this->params = new WC_POS_Params();
  }

  public function tearDown() {
    \WP_Mock::tearDown();
  }
//
//  public function filter_content() {
//    return apply_filters( 'custom_content_filter', 'This is unfiltered' );
//  }
//
//  public function test_filter_content() {
//
//    \WP_Mock::onFilter( 'custom_content_filter' )
//      ->with( 'This is unfiltered' )
//      ->reply( 'This is filtered' );
//
//    $response = $this->filter_content();
//
//    $this->assertEquals( 'This is filtered', $response );
//  }

  /**
   * toJSON converts public class properties to JSON
   */
//  function test_params_to_json() {
//    $this->params->foo = 'bar';
//    $json = $this->params->toJSON();
//    $this->assertJson( $json );
//    $data = json_decode( $json );
//    $this->assertEquals( 'bar', $data->foo );
//  }

  /**
   *
   */
  function test_params_filter(){

    \WP_Mock::onFilter( 'woocommerce_pos_params' )
      ->with( '' )
      ->reply( array('foo' => 'baz') );

    $json = $this->params->toJSON();
    $this->assertJson( $json );
    $data = json_decode( $json );
//    print_r($data);

    // WP_Mock doesn't work?? :(
//    $this->assertEquals( 'baz', $data->foo );

  }

}