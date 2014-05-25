<?php

/**
 * The main POS Class
 * 
 * @class 	  WooCommerce_POS
 * @version   0.2.10
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS {

	/**
	 * Version numbers
	 */
	const VERSION 	= '0.2.11';
	const JQUERY 	= '2.1.0';

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
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
		add_action( 'init', array( $this, 'init' ), 0 );

		// Set up templates
		add_filter('generate_rewrite_rules', array( $this, 'generate_rewrite_rules') );
		add_filter('query_vars', array( $this, 'add_query_vars') );
		add_action('template_redirect', array( $this, 'login') );

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
	 * Fired when the plugin is activated.
	 */
	public static function activate( ) {
		// Refresh the rewrite rule cache
		global $wp_rewrite;
		add_rewrite_rule('pos','index.php?pos=1','top');
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
		include_once( 'includes/class-pos-checkout.php' );
		if ( defined( 'DOING_AJAX' ) ) {
			include_once( 'includes/class-pos-ajax.php' );
		}
	}

	public function init() {
		$this->product  = new WooCommerce_POS_Product();
	}

	/**
	 * Add rewrite rules for pos
	 * @param  object $wp_rewrite
	 */
	public function generate_rewrite_rules( $wp_rewrite ) {
		$custom_page_rules = array(
			'pos' => 'index.php?pos=1',
		);
		$wp_rewrite->rules = $custom_page_rules + $wp_rewrite->rules;
	}
	
	/**
	 * Filter that inserts the custom_page variable into $wp_query
	 * @param  array $public_query_vars
	 * @return array
	 */
	public function add_query_vars( $public_query_vars ) {
		$public_query_vars[] = "pos";
		return $public_query_vars;
	}

	/**
	 * Display POS page or login screen
	 */
	public function login() {

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
		$is_pos = isset($wp_query->query_vars['pos']) && $wp_query->query_vars['pos'] == 1 ? true : false ;

		// // // DEBUG
		// if($is_pos) {
		// 	error_log('you are in POS');
		// } else {
		// 	error_log('you are not in POS');
		// }

		return $is_pos;
	}

	/**
	 * Did the request come from the POS?
	 * @return boolean
	 */
	public function is_pos_referer() {
		$referer = wp_get_referer();
		$parsed_referrer = parse_url( $referer );
		$is_pos_referer = ( $parsed_referrer['path'] == '/pos/' ) ? true : false ;

		// // DEBUG
		// if($is_pos_referer) {
		// 	error_log('request came from POS');
		// } else {
		// 	error_log('request did not come from POS');
		// }
		
		return $is_pos_referer;
	}

	/**
	 * Bypass authenication for WC REST API
	 * @return WP_User object
	 */
	public function wc_api_authentication( $user ) {

		// make everyone admin :(
		$admins = get_users( 'role=administrator&number=1' );
		return $admins[0];

		// this doesn't work!! WC API has set current_user to 0?! 
		// if( current_user_can( 'manage_woocommerce_pos' ) ) {
		// 	return new WP_User( get_current_user_id() );
		// } else {
		// 	return $user;
		// }

	}
	
	/**
	 * Print the CSS for public facing templates
	 * @return [type] [description]
	 */
	public function pos_print_css() {
		$html = '
	<link rel="stylesheet" href="'. $this->plugin_url .'public/assets/css/pos.min.css?ver='. self::VERSION .'" type="text/css" media="all" />
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
	<!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/'.self::JQUERY.'/jquery.min.js"></script> -->
	<!-- Modernizr: checks: indexeddb, websql, localstrorage and CSS 3D transforms -->
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'public/assets/js/vendor/modernizr.custom.min.js"></script>
			';
			echo $html;
		}
		if($section == 'footer') {
			do_action( 'pos_add_to_footer' );
			$this->pos_localize_script();
			$html = '
	<script data-main="'. $this->plugin_url .'public/assets/js/main" src="'. $this->plugin_url .'public/assets/js/require.js"></script>
	<!-- <script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'public/assets/js/lib.min.js?ver='. self::VERSION .'"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'public/assets/js/plugins.min.js?ver='. self::VERSION .'"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'public/assets/js/pos.min.js?ver='. self::VERSION .'"></script> -->
			';
			echo $html;
		}
	}

	/**
	 * Add variables for use by js scripts
	 * @return [type] [description]
	 */
	public function pos_localize_script() {
		$currency_pos = get_option( 'woocommerce_currency_pos' );
		switch ( $currency_pos ) {
			case 'left' :
				$format = array('pos' => '%s%v', 'neg' => '- %s%v', 'zero' => '%s%v');
			break;
			case 'right' :
				$format = array('pos' => '%v%s', 'neg' => '- %v%s', 'zero' => '%v%s');
			break;
			case 'left_space' :
				$format = array('pos' => '%s&nbsp;%v', 'neg' => '- %s&nbsp;%v', 'zero' => '%s&nbsp;%v');
			break;
			case 'right_space' :
				$format = array('pos' => '%v&nbsp;%s', 'neg' => '- %v&nbsp;%s', 'zero' => '%v&nbsp;%s');
			break;
		}

		$js_vars = array(
			'ajax_url' => admin_url( 'admin-ajax.php', 'relative' ),
			'loading_icon' => $this->plugin_url . '/assets/ajax-loader.gif',
			'accounting' => array(
				'settings' => array(
					'currency' => array(
						'symbol' => get_woocommerce_currency_symbol( get_woocommerce_currency() ),   
						'format' => $format,
						'decimal' => get_option( 'woocommerce_price_decimal_sep' ),  
						'thousand'=> get_option( 'woocommerce_price_thousand_sep' ),  
						'precision' => get_option( 'woocommerce_price_num_decimals' ),
					),
					'number' => array(
						'precision' => get_option( 'woocommerce_price_num_decimals' ),  
						'thousand'	=> '',
						'decimal' 	=> get_option( 'woocommerce_price_decimal_sep' ),
					)
				)
			),
			'wc' => array(
				'tax_label' => WC()->countries->tax_or_vat(), 
				'calc_taxes' => get_option( 'woocommerce_calc_taxes' ),
				'prices_include_tax' => get_option( 'woocommerce_prices_include_tax' ),
				'tax_round_at_subtotal' => get_option( 'woocommerce_tax_round_at_subtotal' ),
				'tax_display_cart' => get_option( 'woocommerce_tax_display_cart' ),
				'tax_total_display' => get_option( 'woocommerce_tax_total_display' ),
			),
		);
		$html = '
			<script type="text/javascript">
			var pos_cart_params = ' . json_encode($js_vars) . '
			</script>
		';
		echo $html;
	}
}