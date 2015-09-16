<?php

class TemplateTest extends WP_UnitTestCase {

  protected $template;

  public function setUp(){
    $this->template = new WC_POS_Template();
  }

  public function tearDown() {

  }

  public function test_locate_default_template_files(){

    // create test template
    $test_dir = WC_POS_PLUGIN_PATH . 'includes/views/test';
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

  public function test_locate_template_files(){

    // create test template
    $test_dir = WC_POS_PLUGIN_PATH . 'includes/views/test';
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

}