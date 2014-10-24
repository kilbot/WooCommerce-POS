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

	/* @var string The db prefix for WP Options table */
	static protected $prefix = 'woocommerce_pos_settings_';

	/**
	 * Settings page output method
	 */
	abstract protected function output();

	/**
	 * Construct field name
	 * @param $key
	 * @return string
	 */
	protected function get_setting_name( $key ) {
		if( isset( $this->option_name ) )
			return $this->option_name .'['. $key .']';
	}

	/**
	 * Get field value
	 * @param $key
	 * @return mixed
	 */
	protected function get_setting_value( $key ) {
		if( isset( $this->options[$key] ) )
			return $this->options[$key];
	}

}