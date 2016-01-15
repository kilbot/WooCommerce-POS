<?php

/**
 * Abstract Settings Class
 *
 * @class    WC_POS_Admin_Settings_Page
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Abstract {

  protected static $instance;

  protected $defaults;

  protected $flush_local_data = null;

  public $current_user_authorized = true;

  protected $section_handlers = array();

  /**
   * Returns the Singleton instance of this class.
   * - late static binding requires PHP 5.3+
   *
   * @return Singleton
   */
  public static function get_instance() {
    $class = get_called_class();
    if ( null === static::$instance ) {
      static::$instance = new $class();
    }

    return static::$instance;
  }

  protected function __construct() {
  }

  protected function __clone() {
  }

  protected function __wakeup() {
  }

  /**
   * @return array
   */
  public function get_payload() {
    return array(
      'id'       => $this->id,
      'label'    => $this->label,
      'data'     => $this->get(),
      'template' => $this->get_template(),
      'sections' => $this->get_sections()
    );
  }

  /**
   * Output the view file
   */
  public function output() {
    $file = dirname(__FILE__) . '/views/' . $this->id . '.php';
    if ( is_readable( $file ) ) {
      include $file;
    }
  }

  /**
   * Catch output and format
   */
  public function get_template(){
    ob_start();
    $this->output();
    $template = wc_pos_trim_html_string( ob_get_clean() );
    return apply_filters( 'woocommerce_pos_' . $this->id . '_settings_template', $template, $this );
  }

  /**
   * Return db key
   * @return string
   */
  public function option_name(){
    return WC_POS_Admin_Settings::DB_PREFIX . $this->id;
  }

  /**
   * Get options
   * @param bool|false $key
   * @return bool|mixed|void
   */
  public function get($key = false){
    $data = get_option( $this->option_name() );
    if(!$data){
      $data = apply_filters( 'woocommerce_pos_' . $this->id . '_settings_defaults', $this->get_defaults() );
    }
    if($key && is_array($data)) {
      $data = array_key_exists($key, $data) ? $data[$key] : false;
    }
    return $data;
  }

  /**
   * @param array $data
   * @return array|bool
   */
  public function set(array $data){
    $data['updated_at'] = time(); // forces update_option to return true
    $updated = add_option( $this->option_name(), $data, '', 'no' );
    if(!$updated) {
      $updated = update_option( $this->option_name(), $data );
    }
    return $updated ? $data : false;
  }

  /**
   *
   */
  public function delete(){
    delete_option( $this->option_name() );
    return $this->get();
  }

  /**
   * @return mixed|string|void
   */
  public function getJSON(){
//    return json_encode( $this->get(), JSON_FORCE_OBJECT ); // empty array as object??
    $data = $this->get();
    return $data ? json_encode( $data ) : false;
  }

  /**
   *
   */
  public function get_sections(){
    $sections = array();

    foreach( $this->section_handlers as $class ){
      $handler = $class::get_instance();
      $sections[] = $handler->get_payload();
    }

    return $sections;
  }

  /**
   * Return setting defaults. Merge with settings id.
   */
  public function get_defaults(){
    return wp_parse_args( array(
      'id' => $this->id,
    ), $this->defaults );
  }

  /**
   * @param $data
   * @return bool
   */
  public function flush_local_data( $data = array() ){
    $keys = apply_filters( 'woocommerce_pos_' . $this->id . '_settings_flush_local_data', $this->flush_local_data );
    return ! is_null( $keys );
  }

}