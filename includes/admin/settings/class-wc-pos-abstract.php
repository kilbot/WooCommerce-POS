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
  public $current_user_authorized = true;

  /**
   * Returns the Singleton instance of this class.
   * - late static binding requires PHP 5.3+
   * @return Singleton
   */
  public static function get_instance() {
    $class = get_called_class();
    if (null === static::$instance) {
      static::$instance = new $class();
    }
    return static::$instance;
  }

  protected function __construct() {}
  protected function __clone() {}
  protected function __wakeup() {}

  /**
   * Output the view file
   */
  public function output(){
    include 'views/' . $this->id . '.php';
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
    if(!$data){ $data = $this->defaults; }
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

}