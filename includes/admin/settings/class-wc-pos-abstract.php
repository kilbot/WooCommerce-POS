<?php

/**
 * Abstract Settings Page Class
 *
 * @class    WC_POS_Admin_Settings_Page
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

abstract class WC_POS_Admin_Settings_Abstract {

  protected $default_settings;
  public $current_user_authorized = true;

  /**
   * Output the view file
   */
  public function output(){
    include 'views/' . $this->id . '.php';
  }

  public function get_data($key = false){
    $data = $this->stored_data() ? $this->stored_data() : $this->default_settings;

    if($key && is_array($data)) {
      $data = array_key_exists($key, $data) ? $data[$key] : false;
    }

    return $data;
  }

  /**
   * Get stored data from db
   * note: get_option caches data
   * @return mixed|void
   */
  protected function stored_data(){
    return get_option(WC_POS_Admin_Settings::DB_PREFIX . $this->id);
  }

  /**
   * @param array $data
   * @return array|bool
   */
  public function save(array $data){
    $data['updated_at'] = time(); // forces update_option to return true
    $updated = add_option( WC_POS_Admin_Settings::DB_PREFIX . $this->id, $data, '', 'no' );
    if(!$updated) {
      $updated = update_option( WC_POS_Admin_Settings::DB_PREFIX . $this->id, $data );
    }
    return $updated ? $data : false;
  }

  /**
   *
   */
  public function delete(){

  }

}