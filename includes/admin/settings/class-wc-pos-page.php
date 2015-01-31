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
	public $current_user_authorized = true;

	/**
	 * Output the view file
	 */
	public function output(){
		include 'views/' . $this->id . '.php';
	}

	public function get_data(){
		if(!$this->data){
			$this->data = get_option( WC_POS_Admin_Settings::DB_PREFIX . $this->id );
		}
		return $this->data;
	}

}