<?php

/**
 * The main POS Class
 * 
 * @class 	  WooCommerce_POS
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS {

	/** Version numbers */
	const VERSION = '0.3.3';
	const JQUERY_VERSION = '2.1.1';

	/** Development flag */
	public $development = false;

	/** Unique identifier */
	protected $plugin_slug = 'woocommerce-pos';

	/** @var object Instance of this class. */
	protected static $instance = null;

	/** @var string WooCommerce API endpoint */
	public $wc_api_url;

	/** @var string Plugin paths */
	public $plugin_dir;
	public $plugin_path;
	public $plugin_url;

	/** @var bool Flag for requests coming from POS */
	public $is_pos = false;
	public $template = null;

	/** @var object WooCommerce_POS_Product */
	public $product = null;

	/** @var object WooCommerce_POS_Checkout */
	public $checkout = null;

	/** @var object WooCommerce_POS_Currency */
	public $currency = null;

	/** @var cache logged in user id */
	private $logged_in_user = false;


	/**
	 * Initialize WooCommerce_POS
	 */
	private function __construct() {

		// set is_pos flag for AJAX, API requests
		if( isset( $_REQUEST['pos'] ) && $_REQUEST['pos'] == 1 )
			$this->is_pos = true;
		
		// settings
		$this->wc_api_url = home_url('/wc-api/v1/', 'relative');

		$this->plugin_path 	= trailingslashit( dirname( dirname(__FILE__) ) );
		$this->plugin_dir 	= trailingslashit( basename( $this->plugin_path ) );
		$this->plugin_url 	= plugins_url().'/'.$this->plugin_dir;

		// include required files
		$this->includes();

		// init
		add_action( 'init', array( $this, 'init' ), 0 );

		// Set up templates
		add_filter( 'generate_rewrite_rules', array( $this, 'generate_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		add_action( 'parse_request', array( $this, 'parse_request' ) );
		add_action( 'template_redirect', array( $this, 'template_redirect' ) );

		// allow access to the WC REST API
		add_filter( 'woocommerce_api_check_authentication', array( $this, 'wc_api_authentication' ), 10, 1 );
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

	/**
	 * File includes
	 */
	private function includes() {
		include_once( 'includes/class-pos-product.php' );
		include_once( 'includes/class-pos-checkout.php' );
		include_once( $this->plugin_path . 'includes/class-pos-payment-gateways.php' );
		include_once( $this->plugin_path . 'includes/class-pos-support.php' );
		if ( defined( 'DOING_AJAX' ) ) {
			include_once( 'includes/class-pos-ajax.php' );
		}

		include_once( $this->plugin_path . 'includes/class-pos-currency.php' );
		include_once( 'includes/pos-template-hooks.php' );
	}

	/**
	 * Init WooCommerce POS
	 */
	public function init() {
		global $current_user;
		
		// get and set current user for api auth
		if ( isset( $current_user ) && ( $current_user instanceof WP_User ) && $current_user->ID != 0 )
			$this->logged_in_user = $current_user;

		// Set up localisation
		$this->load_plugin_textdomain();

		// Load class instances
		$this->product = new WooCommerce_POS_Product();
		$this->checkout = new WooCommerce_POS_Checkout();
		$this->currency = new WooCommerce_POS_Currency();
	}

	/**
	 * Add rewrite rules for pos
	 * @param  object $wp_rewrite
	 */
	public function generate_rewrite_rules( $wp_rewrite ) {
		$custom_page_rules = array(
			'^pos/?$' => 'index.php?pos=1',
			'^pos/([^/]+)/?$' => 'index.php?pos=1&pos_template='.$wp_rewrite->preg_index(1)
		);
		$wp_rewrite->rules = $custom_page_rules + $wp_rewrite->rules;
	}

	/**
	 * Construct the public pos urls
	 * @param  string $page the pos_template
	 * @return string       url
	 */
	public function pos_url( $page = '' ) {

		// WC REST API requires pretty permalinks
		// so POS only supports pretty permalinks ... for the moment
		return home_url('pos/'.$page);
	}

	/**
	 * Check if is POS template request
	 */
	public function parse_request( $wp ) {
		if( isset( $wp->query_vars['pos'] ) && $wp->query_vars['pos'] == 1 ) {
			$this->is_pos = true;
			$this->template = isset( $wp->query_vars['pos_template'] ) ? $wp->query_vars['pos_template'] : 'main';
		}
	}
	
	/**
	 * Filter that inserts the custom_page variable into $wp_query
	 * @param  array $public_query_vars
	 * @return array
	 */
	public function add_query_vars( $public_query_vars ) {
		$public_query_vars[] = 'pos';
		$public_query_vars[] = 'pos_template';
		return $public_query_vars;
	}

	/**
	 * Display POS page or login screen
	 */
	public function template_redirect() {
		// bail if not pos
		if( !$this->is_pos ) 
			return;

		// set up $current_user for use in includes
		global $current_user;
		get_currentuserinfo();

		// check page and credentials
		if ( is_user_logged_in() && current_user_can('manage_woocommerce_pos') ) {

			// check if template exists
			if( $this->template !== 'main' && file_exists( $this->plugin_path . 'public/views/' . $this->template . '.php' ) ) {
				if( $this->template === 'support') $this->support = new WooCommerce_POS_Support();
				include_once( 'views/' . $this->template . '.php' );
			}

			// else: default to main page
			else {
				include_once( 'views/pos.php' );
			}			
			exit;

		// insufficient privileges 
		} elseif ( is_user_logged_in() && !current_user_can('manage_woocommerce_pos') ) {
			wp_die( __('You do not have sufficient permissions to access this page.') );

		// else login
		} else {
			auth_redirect();
		}
	}

	/**
	 * Bypass authenication for WC REST API
	 * @return WP_User object
	 */
	public function wc_api_authentication( $user) {

		if( $this->is_pos ) {
			$user = $this->logged_in_user;
			if( !user_can( $user->ID, 'manage_woocommerce_pos' ) ) {
				$user = new WP_Error( 'woocommerce_pos_authentication_error', __( 'User not authorized to manage WooCommerce POS', 'woocommerce-pos' ), array( 'code' => 500 ) );
			}
		} 

		return $user;
	}

	/** Load Instances on demand **********************************************/

	/**
	 * Get gateways class
	 *
	 * @return WC_Payment_Gateways
	 */
	public function payment_gateways() {
		return WooCommerce_POS_Payment_Gateways::get_instance();
	}

}