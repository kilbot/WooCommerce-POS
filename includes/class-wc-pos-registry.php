<?php
/**
 * Class registry
 * Allows 'global' access to registered class methods
 *
 * @class    WC_POS_Registry
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Registry {

	protected static $instance = NULL;

	private $storage = array();

	function add( $id, $class ) {
		$this->storage[$id] = $class;
	}

	function get( $id ) {
		return array_key_exists( $id, $this->storage ) ? $this->storage[$id] : NULL;
	}

	public static function instance() {

		if ( is_null( self::$instance ) ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

}