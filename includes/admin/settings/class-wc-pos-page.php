<?php

/**
 * Abstract Settings Page Class
 *
 * @class    WC_POS_Admin_Settings_Page
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Page {

	public function __construct() {

	}

	protected function get_option_key( $key ) {
		if( isset($this->id) )
			return $this->option_key .'['. $key .']';
	}

	protected function get_option_data( $key ) {
		if( isset( $this->options[$key] ) )
			return $this->options[$key];
	}

}