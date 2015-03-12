<?php

/**
 * The main POS Pro Class
 * 
 * @class 	  WooCommerce_POS_Pro
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Pro {

	/**
	 * Version numbers
	 */
	const VERSION = '0.3.2';

	/**
	 * Unique identifier
	 */
	protected $plugin_slug = 'woocommerce-pos-pro';

	/**
	 * Instance of this class.
	 * @var object
	 */
	protected static $instance = null;

	/**
	 * Plugin variables
	 * @var string
	 */
	public $plugin_dir;
	public $plugin_path;
	public $plugin_url;

	/**
	 * Initialize WooCommerce_POS_Pro
	 */
	private function __construct() {

		$this->plugin_path 	= trailingslashit( dirname( dirname(__FILE__) ) );
		$this->plugin_dir 	= trailingslashit( basename( $this->plugin_path ) );
		$this->plugin_url 	= plugins_url().'/'.$this->plugin_dir;

		// Load plugin text domain
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

	}

	/**
	 * Return the plugin slug.
	 * @return string
	 */
	public function get_plugin_slug() {
		return $this->plugin_slug;
	}

	/**
	 * Return an instance of this class.
	 * @return object
	 */
	public static function get_instance() {

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * Load the plugin text domain for translation.
	 */
	public function load_plugin_textdomain() {

		$domain = $this->plugin_slug;
		$locale = apply_filters( 'plugin_locale', get_locale(), $domain );

		load_textdomain( $domain, trailingslashit( WP_LANG_DIR ) . $domain . '/' . $domain . '-' . $locale . '.mo' );
		load_plugin_textdomain( $domain, FALSE, basename( plugin_dir_path( dirname( __FILE__ ) ) ) . '/languages/' );

	}

}