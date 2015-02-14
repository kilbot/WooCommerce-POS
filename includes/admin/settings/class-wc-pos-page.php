<?php

/**
 * Abstract Settings Page Class
 *
 * @class    WC_POS_Admin_Settings_Page
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

abstract class WC_POS_Admin_Settings_Page {

  protected $data;
  protected $default_settings;
  public $current_user_authorized = true;

  /**
   * Output the view file
   */
  public function output(){
    include 'views/' . $this->id . '.php';
  }

  public function get_data(){
    if(!$this->data){
      $this->data = $this->stored_data() ? $this->stored_data() : $this->default_settings;
    }
    return $this->data;
  }

  private function stored_data(){
    return WC_POS_Admin_Settings::get_settings($this->id);
  }

}