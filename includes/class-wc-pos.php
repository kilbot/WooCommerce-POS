<?php

/**
 * The main POS Class
 *
 * @class 	  WC_POS
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS {

	/** @var object Instance of this class. */
	protected static $instance = null;

	public $admin;

	/**
	 * Protected constructor to prevent creating a new instance of the
	 * WC_POS via the `new` operator from outside of this class.
	 */
//	protected function __construct() {
	public function __construct() {

		$this->plugin_name = 'woocommerce-pos';

		// auto load classes
		if ( function_exists( 'spl_autoload_register' ) ) {
			spl_autoload_register( array( $this, 'autoload' ) );
		}

		$this->load_dependencies();

	}

	/**
	 * Autoload classes prefixed with WC_POS_
	 *
	 * @param $class
	 */
	private function autoload( $class ) {

		// check for WooCommerce_POS_Pro_ prefix
		$cn = strtolower( $class );
		$key = preg_replace( '/^wc_pos_/', '', $cn );
		if( $key == $cn ) return; // ignore non WC_POS_ prefix

		// classes key => path
		$classes = array(
			'i18n'      => 'includes/class-wc-pos-i18n.php',

			// admin
			'admin'     => 'includes/admin/class-wc-pos-admin.php',
			'admin_menu'=> 'includes/admin/class-wc-pos-admin-menu.php',
		);

		// require file
		if ( isset( $classes[ $key ] ) ) {
			require_once WC_POS_PLUGIN_PATH . $classes[ $key ];
		}
	}

	/**
	 * Load the required dependencies for this plugin.
	 */
	private function load_dependencies() {

		require_once WC_POS_PLUGIN_PATH . 'includes/wc-pos-functions.php';

		// internationalization
		new WC_POS_i18n();

		// admin
		new WC_POS_Admin();

	}

}