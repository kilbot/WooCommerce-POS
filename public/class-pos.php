<?php

/**
 * The main POS Class
 * 
 * @class 	  WooCommerce_POS
 * @version   0.3
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS {

	/**
	 * Version numbers
	 */
	const VERSION 			= '0.2.5';
	const JQUERY 			= '2.1.0'; // http://jquery.com/

	/**
	 * Unique identifier
	 */
	protected $plugin_slug = 'woocommerce-pos';

	/**
	 * Instance of this class.
	 * @var object
	 */
	protected static $instance = null;

	/**
	 * WooCommerce API endpoint
	 */
	public $wc_api_endpoint = '/wc-api/v1/';
	public $wc_api_url;

	/**
	 * Plugin variables
	 * @var string
	 */
	public $plugin_dir;
	public $plugin_path;
	public $plugin_url;

	/**
	 * @var WooCommerce_POS_Product $product
	 */
	public $product = null;

	/**
	 * @var WooCommerce_POS_Cart $cart
	 */
	public $cart = null;

	/**
	 * @var WooCommerce_POS_Checkout $checkout
	 */
	public $checkout = null;

	/**
	 * Initialize WooCommerce_POS
	 */
	private function __construct() {
		
		// settings
		$this->wc_api_url = get_home_url().$this->wc_api_endpoint;

		$this->plugin_path = trailingslashit( dirname( dirname(__FILE__) ) );
		$this->plugin_dir = trailingslashit( basename( $this->plugin_path ) );
		$this->plugin_url = plugins_url().'/'.$this->plugin_dir;

		// include required files
		$this->includes();

		// Load plugin text domain
		//add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
		add_action( 'init', array( $this, 'init' ), 0 );

		// allow access to the WC REST API 
		add_filter( 'woocommerce_api_check_authentication', array( $this, 'wc_api_authentication' ) );

		// Set up templates
		add_filter('generate_rewrite_rules', array( $this, 'pos_generate_rewrite_rules') );
		add_filter('query_vars', array( $this, 'pos_query_vars') );
		add_action('template_redirect', array( $this, 'pos_login') );
				
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
	 * Fired when the plugin is activated.
	 */
	public static function activate( ) {
		// Refresh the rewrite rule cache
		global $wp_rewrite;
		add_rewrite_rule('pos','index.php?custom_page=pos','top');
		$wp_rewrite->flush_rules( false ); // false will not overwrite .htaccess

		// add the manage_woocommerce_pos capability to administrator and shop_manager
		$administrator = get_role( 'administrator' );
		$administrator->add_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		$shop_manager->add_cap( 'manage_woocommerce_pos' );
	}

	/**
	 * Fired when the plugin is deactivated.
	 */
	public static function deactivate( ) {
		// can not remove rewrite rule on deactivation AFAIK

		// remove the manage_woocommerce_pos capability to administrator and shop_manager
		$administrator = get_role( 'administrator' );
		$administrator->remove_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		$shop_manager->remove_cap( 'manage_woocommerce_pos' );
	}


	private function includes() {
		include_once( 'includes/class-pos-product.php' );
		include_once( 'includes/class-pos-cart.php' );
		include_once( 'includes/class-pos-checkout.php' );
		if ( defined( 'DOING_AJAX' ) ) {
			include_once( 'includes/class-pos-ajax.php' );
		}
	}

	public function init() {
		$this->product  = new WooCommerce_POS_Product();
		$this->cart     = new WooCommerce_POS_Cart();
		$this->checkout = new WooCommerce_POS_Checkout();
	}

	/**
	 * Add rewrite rules for pos
	 * @param  object $wp_rewrite
	 */
	public function pos_generate_rewrite_rules($wp_rewrite) {
		$custom_page_rules = array(
			'pos' => 'index.php?custom_page=pos',
		);
		$wp_rewrite->rules = $custom_page_rules + $wp_rewrite->rules;
	}
	
	/**
	 * Filter that inserts the custom_page variable into $wp_query
	 * @param  array $public_query_vars
	 * @return array
	 */
	public function pos_query_vars($public_query_vars) {
		$public_query_vars[] = "custom_page";
		return $public_query_vars;
	}

	/**
	 * Display POS page or login screen
	 */
	public function pos_login() {

		// check page and credentials
		if ($this->is_pos() && current_user_can('manage_woocommerce_pos')) {
			
			// we've good to go, render the page
			include_once( 'views/pos.php' );
			exit;

		} elseif ($this->is_pos() && !current_user_can('manage_woocommerce_pos')) {

			// redirect to login page
			auth_redirect();
		}
	}

	/**
	 * Are we using point of sale front-end?
	 * @return boolean
	 */
	public function is_pos() {
		// $pagename = $this->options['pagename']; TODO: set custom url as an option
		global $wp_query;
		$custom_page = isset($wp_query->query_vars['custom_page']) ? $wp_query->query_vars['custom_page'] : null;
		return ($custom_page == 'pos') ?  true : false ;
	}

	/**
	 * Bypass authenication for WC REST API
	 * @return WP_User object
	 */
	public function wc_api_authentication() {
		// giving admin and shop manager full access to WC API
		// TODO: check this is a good approach
		if(current_user_can('manage_woocommerce_pos'))
			return new WP_User(get_current_user_id());
	}
	
	/**
	 * Print the CSS for public facing templates
	 * @return [type] [description]
	 */
	public function pos_print_css() {
		$html = '
	<link rel="stylesheet" href="'. $this->plugin_url .'/public/assets/css/pos.min.css" type="text/css" media="all" />
		';
		echo $html;
	}

	/**
	 * Print the head JS for public facing templates
	 * @return [type] [description]
	 */
	public function pos_print_js ($section = '') {
		if($section == 'head') {
			$html = '
	<script src="//ajax.googleapis.com/ajax/libs/jquery/'.self::JQUERY.'/jquery.min.js"></script>
	<!-- Modernizr: uses CSS 3D Transforms -->
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/vendor/modernizr.custom.js"></script>
			';
			echo $html;
		}
		if($section == 'footer') {
			do_action( 'pos_add_to_footer' );
			$this->pos_localize_script();
			$html = '
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib.min.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/plugins.min.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/pos.min.js"></script>
			';
			echo $html;
		}
	}

	/**
	 * Add variables for use by js scripts
	 * @return [type] [description]
	 */
	public function pos_localize_script() {
		$js_vars = array(
				'ajax_url' => admin_url( 'admin-ajax.php', 'relative' ),
				'loading_icon' => $this->plugin_url . '/assets/ajax-loader.gif',
			);
		$html = '
			<script type="text/javascript">
			var pos_cart_params = ' . json_encode($js_vars) . ';
			</script>
		';
		echo $html;
	}
}