<?php

/**
 * POS Templates
 *
 * @class    WC_POS_API_Templates
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\API;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RecursiveRegexIterator;
use RegexIterator;
use WC_API_Resource;
use WC_API_Server;

class Templates extends WC_API_Resource {

  protected $base = '/pos/templates';

  /**
   * Register routes for POS Params
   *
   * GET /pos
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( array $routes ) {

    # GET /pos/templates
    $routes[ $this->base ] = array(
      array( array( $this, 'get_templates' ), WC_API_Server::READABLE ),
      array( array( $this, 'create_receipt_template' ), WC_API_Server::CREATABLE | WC_API_Server::ACCEPT_DATA )
    );

    # PUT, DELETE /pos/templates/<id>
    $routes[ $this->base . '/(?P<id>\d+)' ] = array(
      array( array( $this, 'update_receipt_template' ), WC_API_Server::EDITABLE | WC_API_Server::ACCEPT_DATA ),
      array( array( $this, 'delete_receipt_template' ), WC_API_Server::DELETABLE ),
    );

    # GET /pos/templates/modal/<id>
    $routes[ $this->base . '/modal/(?P<id>\w+)' ] = array(
      array( array( $this, 'get_modal' ), WC_API_Server::READABLE )
    );

    return $routes;

  }

  /**
   * Returns the partials directory
   *
   * @return string
   */
  public function get_template_dir() {
    return \WC_POS\PLUGIN_PATH . 'includes/views';
  }

  /**
   * @param null $wc_pos_admin
   * @return array
   */
  public function get_templates( $wc_pos_admin = null, $filter = array() ){

    if(isset($filter['type']) && $filter['type'] == 'receipt'){
      return $this->get_receipt_template();
    }

    if( $wc_pos_admin ){
      return;
    }

    return apply_filters( 'woocommerce_pos_templates', $this->create_templates_array(), $this );
  }

  /**
   * @param $partials_dir
   * @return array
   */
  public function create_templates_array( $partials_dir = '' ) {
    $templates = array();

    foreach ( $this->locate_template_files( $partials_dir ) as $slug => $file ) {
      $keys = explode( substr( $slug, 0, 1 ), substr( $slug, 1 ) );
      $template = array_reduce( array_reverse( $keys ), 'self::reduce_templates_array', $this->template_output( $file ) );
      $templates = array_merge_recursive( $templates, $template );
    }

    return $templates;
  }

  /**
   * Returns an array of template paths
   *
   * @param $partials_dir
   * @return array
   */
  public function locate_template_files( $partials_dir = '' ) {
    $files = array();
    foreach ( $this->locate_default_template_files( $partials_dir ) as $slug => $path ) {
      $files[ $slug ] = $this->locate_template_file( $path );
    };

    return $files;
  }

  /**
   * Returns an assoc array of all default tmpl-*.php paths
   * - uses SPL iterators
   *
   * @param $partials_dir
   * @return array
   */
  public function locate_default_template_files( $partials_dir = '' ) {
    if ( empty( $partials_dir ) )
      $partials_dir = $this->get_template_dir();

    $Directory = new RecursiveDirectoryIterator( $partials_dir );
    $Iterator = new RecursiveIteratorIterator( $Directory, RecursiveIteratorIterator::SELF_FIRST );
    $Regex = new RegexIterator( $Iterator, '/^.+tmpl-[a-z-]+\.php$/i', RecursiveRegexIterator::GET_MATCH );

    $paths = array_keys( iterator_to_array( $Regex ) );
    $templates = array();

    foreach ( $paths as $path ) {
      $slug = str_replace( array( $partials_dir, '.php' ), '', $path );
      $templates[ $slug ] = $path;
    };

    return $templates;
  }

  /**
   * Locate a single template partial
   *
   * @param string $default_path
   * @return string
   */
  public function locate_template_file( $default_path = '' ) {
    $custom_path1 = str_replace( $this->get_template_dir(), 'woocommerce-pos', $default_path );
    $custom_path2 = str_replace( 'tmpl-', '', $custom_path1 );
    $custom = locate_template( array( $custom_path1, $custom_path2 ) );

    return $custom ? $custom : $default_path;
  }

  /**
   * @param $result
   * @param $key
   * @return array
   */
  private function reduce_templates_array( $result, $key ) {
    if ( is_string( $result ) )
      $key = preg_replace( '/^tmpl-/i', '', $key );
    return array( $key => $result );
  }

  /**
   * Output template partial as string
   *
   * @param $file
   * @return string
   */
  public function template_output( $file, $trim = true ) {
    $template = '';

    if( is_readable( $file ) ){
      ob_start();
      include $file;
      $template = ob_get_contents();
      ob_end_clean();
    }

    return $trim ? wc_pos_trim_html_string( $template ) : $template ;
  }

  /**
   * Returns path of print receipt template
   * @param $file
   * @return
   */
  public function locate_print_receipt_template($file) {
    $receipt_path = $this->locate_template_file( \WC_POS\PLUGIN_PATH . 'includes/views/print/' . $file );
    return apply_filters( 'woocommerce_pos_print_receipt_path', $receipt_path );
  }

  /**
   * @param string $id
   * @return string|WP_Error
   */
  public function get_modal( $id = '' ){
    $default_path = $this->get_template_dir() . '/modals/' . $id . '.php';
    $file = $this->locate_template_file( $default_path );
    $template = $this->template_output( $file );

    return $template;
  }

  /**
   *
   */
  public function get_receipt_template() {
    $this->register_receipt_status();

    $settings = wc_pos_get_option('receipts', 'receipt_options');
    $type     = isset($settings['template_language']) ? $settings['template_language'] : 'html';
    $method   = isset($settings['print_method']) ? $settings['print_method'] : 'browser';
    $options  = isset($settings[$method . '_options']) ? $settings[$method . '_options'] : '';

    $posts = get_posts( array(
      'posts_per_page'  => 1,
      'post_type'       => 'wc-print-template',
      'post_status'     => $type
    ));

    if(!empty($posts)){
      $template = $posts[0];
      return array(
        'id'        => $template->ID,
        'type'      => $type,
        'method'    => $method,
        'options'   => $options,
        'template'  => $template->post_content
      );
    }

    $path = $this->locate_print_receipt_template('receipt-' . $type . '.php');

    // backwards compat
    if(!$path && $type == 'html'){
      $path = $this->locate_print_receipt_template('tmpl-receipt.php');
    }

    return array(
      'type'      => $type,
      'method'    => $method,
      'options'   => $options,
      'template'  => $this->template_output( $path, false )
    );
  }

  /**
   *
   */
  public function create_receipt_template( array $data ) {
    return $this->update_receipt_template(null, $data);
  }

  /**
   * 
   */
  public function update_receipt_template( $id, array $data ) {
    $template = isset($data['template']) ? $data['template'] : '';
    $post_status = wc_pos_get_option('receipts', array(
      'section' => 'receipt_options',
      'key'     => 'template_language'
    ));

    $args = array(
      'ID'             => (int) $id,
      'post_type'      => 'wc-print-template',
      'post_status'    => $post_status,
      'post_title'     => 'Receipt Template',
      'post_content'   => $template,
      'comment_status' => 'closed',
      'ping_status'    => 'closed'
    );

    wp_insert_post($args);

    return $this->get_receipt_template();
  }

  /**
   * @param $id
   * @return array
   */
  public function delete_receipt_template( $id ) {
    $post = get_post($id);

    if($post && $post->post_type == 'wc-print-template'){
      wp_delete_post($id);
    }

    return $this->get_receipt_template();
  }

  /**
   *
   */
  private function register_receipt_status(){
    $receipt_types = array(
      'html' => array(),
      'epos-print' => array(),
      'escp' => array()
    );

    foreach ( $receipt_types as $type => $values ) {
      register_post_status( $type, $values );
    }
  }

}