<?php

/**
 * Hotkeys
 *
 * @class    WC_POS_Admin_Settings_Hotkeys
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Hotkeys extends WC_POS_Admin_Settings_Page {

	/**
	 * Each settings tab requires an id and label
	 */
	public function __construct() {
		$this->id    = 'hotkeys';
		$this->label = __( 'Hotkeys', 'woocommerce-pos' );
	}

}