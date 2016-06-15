<?php

namespace WC_POS\Unit_Tests\API;

use WP_UnitTestCase;
use WC_POS\API\Templates;
use WC_POS\Admin\Settings;

class TemplateTest extends WP_UnitTestCase {

  protected $template;

  public function setUp(){
    $this->template = new Templates( $this->mock_api_server() );
  }

  function mock_api_server(){
    $stub = $this->getMockBuilder('WC_API_Server')
      ->disableOriginalConstructor()
      ->getMock();

    return $stub;
  }

  /**
   * @param int $length
   * @return string
   */
  protected function generate_random_string($length=10) {
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
  public function test_locate_default_template_files(){

    // create test template
    $test_dir = \WC_POS\PLUGIN_PATH . 'includes/views/test';
    $test_file = $test_dir. '/tmpl-test.php';

    if( !is_dir( $test_dir ) )
      mkdir($test_dir);
    file_put_contents( $test_file, '' );

    $files = $this->template->locate_default_template_files();
    $this->assertContains( $test_file, $files );

    // delete test template
    unlink( $test_file );
    rmdir( $test_dir );
  }

  /**
   *
   */
  public function test_locate_template_files(){

    // create test template
    $test_dir = \WC_POS\PLUGIN_PATH . 'includes/views/test';
    $test_file = $test_dir. '/tmpl-test.php';

    if( !is_dir( $test_dir ) )
      mkdir($test_dir);
    file_put_contents( $test_file, '' );

    // create custom template
    $custom_dir = get_template_directory() . '/woocommerce-pos/test';
    $custom_file = $custom_dir . '/tmpl-test.php';

    if( !is_dir( $custom_dir ) )
      mkdir($custom_dir, 0777, true);
    file_put_contents( $custom_file, '' );

    $files = $this->template->locate_template_files();
    $this->assertContains( $custom_file, $files );

    // delete custom template
    unlink( $custom_file );

    // test second option
    $custom_file2 = $custom_dir . '/test.php';
    file_put_contents( $custom_file2, '' );
    $files = $this->template->locate_template_files();
    $this->assertContains( $custom_file2, $files );

    // delete test file
    unlink( $test_file );
    rmdir( $test_dir );

    // delete custom template
    unlink( $custom_file2 );
    rmdir( $custom_dir );
  }

  /**
   *
   */
  public function test_create_receipt_template() {
    $content = $this->generate_random_string();

    $this->template->create_receipt_template( array(
      'template' => $content
    ) );

    $posts = get_posts( array(
      'posts_per_page'  => 1,
      'post_type'       => 'wc-print-template',
      'post_status'     => 'html, epos-print, escp'
    ));

    $template = $posts[0];

    $this->assertEquals($content, $template->post_content);
    $this->assertEquals('html', $template->post_status);
  }

  /**
   *
   */
  public function test_update_receipt_template() {
    $content = $this->generate_random_string();

    $posts = get_posts( array(
      'posts_per_page'  => 1,
      'post_type'       => 'wc-print-template',
      'post_status'     => 'html, epos-print, escp'
    ));

    $template = $posts[0];
    $post_id = $template->ID;

    update_option( Settings::DB_PREFIX . 'receipt_options', array(
      'template_language' => 'epos-print'
    ) );

    $this->template->update_receipt_template( $post_id, array(
      'template' => $content
    ) );

    $posts = get_posts( array(
      'posts_per_page'  => 1,
      'post_type'       => 'wc-print-template',
      'post_status'     => 'html, epos-print, escp'
    ));

    $template = $posts[0];

    $this->assertEquals($content, $template->post_content);
    $this->assertEquals('epos-print', $template->post_status);

    delete_option( Settings::DB_PREFIX . 'receipt_options' );
  }

  /**
   *
   */
  public function test_delete_receipt_template() {

    $posts = get_posts( array(
      'posts_per_page'  => 1,
      'post_type'       => 'wc-print-template',
      'post_status'     => 'html, epos-print, escp'
    ));

    $template = $posts[0];
    $post_id = $template->ID;

    $this->template->delete_receipt_template( $post_id );

    $posts = get_posts( array(
      'posts_per_page'  => -1,
      'post_type'       => 'wc-print-template',
      'post_status'     => 'html, epos-print, escp'
    ));

    $this->assertEmpty($posts);
  }

}