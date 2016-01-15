<?php

/**
 * POS Templates
 *
 * @class    WC_POS_API_Templates
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

class WC_POS_API_Templates extends WC_API_Resource {

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
      array( array( $this, 'get_templates' ), WC_API_Server::READABLE )
    );

    # GET /pos/templates
    $routes[ $this->base . '/receipt' ] = array(
      array( array( $this, 'get_receipt_template' ), WC_API_Server::READABLE )
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
    return WC_POS_PLUGIN_PATH . 'includes/views';
  }

  /**
   * @param null $wc_pos_admin
   * @return array
   */
  public function get_templates( $wc_pos_admin = null ){
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

    $Iterator = new RecursiveIteratorIterator(
      $Directory,
      RecursiveIteratorIterator::SELF_FIRST
    );

    $Regex = new RegexIterator(
      $Iterator,
      '/^.+tmpl-[a-z-]+\.php$/i',
      RecursiveRegexIterator::GET_MATCH
    );

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
   */
  public function locate_print_receipt_template() {
    $receipt_path = $this->locate_template_file( WC_POS_PLUGIN_PATH . 'includes/views/print/tmpl-receipt.php' );
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
    $default_path = '';
    $path = $this->locate_print_receipt_template();

    return array(
      'path'         => $path,
      'default_path' => $default_path,
      'custom'       => $path != $default_path,
      'template'     => $this->template_output( $path, false )
    );
  }

}