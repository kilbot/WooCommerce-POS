<?php

/**
 * WP Admin Class
 * conditionally loads classes for WP Admin
 *
 * @package  WCPOS\Admin
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class Admin {

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init();
		add_action( 'current_screen', array( $this, 'conditional_init' ) );
	}

	/**
	 * Load admin subclasses
	 */
	private function init() {
		new Admin\Notices();
		new Admin\Menu();
		new Admin\Settings();
		new Admin\Status();
		new Admin\Gateways();
	}

	/**
	 * Conditionally load subclasses
	 * @param $current_screen
	 */
	public function conditional_init( $current_screen ) {

		// Add setting to permalink page
		if ( $current_screen->id == 'options-permalink' ) {
			new Admin\Permalink();
		}

		// Add POS settings to orders pages
		if ( $current_screen->id == 'shop_order' || $current_screen->id == 'edit-shop_order' ) {
			new Admin\Orders();
		}

		// Customise plugins page
		if ( $current_screen->id == 'plugins' ) {
			new Admin\Plugins();
		}

	}

}
