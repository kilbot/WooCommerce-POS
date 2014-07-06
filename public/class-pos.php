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

	/**
	 * Version numbers
	 */
	const VERSION = '0.3.1';
	const JQUERY_VERSION = '2.1.1';

	/**
	 * Development flag
	 */
	public $development = false;

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
	 * @var WooCommerce_POS_Product $product
	 */
	public $support = null;

	/**
	 * Initialize WooCommerce_POS
	 */
	private function __construct() {
		
		// settings
		$this->wc_api_url = home_url('/wc-api/v1/', 'relative');

		$this->plugin_path 	= trailingslashit( dirname( dirname(__FILE__) ) );
		$this->plugin_dir 	= trailingslashit( basename( $this->plugin_path ) );
		$this->plugin_url 	= plugins_url().'/'.$this->plugin_dir;

		// include required files
		$this->includes();

		// Load plugin text domain
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

		// Set up templates
		add_filter('generate_rewrite_rules', array( $this, 'generate_rewrite_rules') );
		add_filter('query_vars', array( $this, 'add_query_vars') );
		add_action('template_redirect', array( $this, 'show_pos') );

		// allow access to the WC REST API, init product class before serving response
		add_filter( 'woocommerce_api_check_authentication', array( $this, 'wc_api_authentication' ), 10, 1 );
		add_action( 'woocommerce_api_server_before_serve', array( $this, 'wc_api_init') );
				
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
		include_once( $this->plugin_path . 'includes/class-pos-support.php' );
		if ( defined( 'DOING_AJAX' ) ) {
			include_once( 'includes/class-pos-ajax.php' );
		}
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
	public function show_pos() {

		$template = $this->is_pos();
		if( !$template )
			return;

		// set up $current_user for use in includes
		global $current_user;
		get_currentuserinfo();

		// check page and credentials
		if ( is_user_logged_in() && current_user_can('manage_woocommerce_pos') ) {

			// check if template exists
			if( $template !== 'main' && file_exists( $this->plugin_path . 'public/views/' . $template . '.php' ) ) {
				if( $template === 'support') $this->support = new WooCommerce_POS_Support();
				include_once( 'views/' . $template . '.php' );
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
	 * Are we using point of sale front-end?
	 * @return string or false
	 */
	public function is_pos() {
		// $pagename = $this->options['pagename']; TODO: set custom url as an option
		global $wp_query;
		$is_pos = false;

		if( get_query_var( 'pos' ) == 1 ) {
			$is_pos = ( get_query_var( 'pos_template' ) ) ? get_query_var( 'pos_template' ) : 'main';
		}

		return $is_pos;
	}

	/**
	 * Bypass authenication for WC REST API
	 * @return WP_User object
	 */
	public function wc_api_authentication( $user) {

		// get user_id from the wp logged in cookie
		$user_id = apply_filters( 'determine_current_user', false );

		// if user can manage_woocommerce_pos, open the api
		if( is_numeric($user_id) && user_can( $user_id, 'manage_woocommerce_pos' ) ) {
			// error_log( print_R( $user, TRUE ) ); //debug
			return new WP_User( $user_id );
		} else {
			return $user;
		}
	}

	/**
	 * Instantiate the Product Class when making api requests
	 * @param  object $api_server  WC_API_Server Object      
	 */
	public function wc_api_init( $api_server ) {

		// check both GET & POST requests
		$params = array_merge($api_server->params['GET'], $api_server->params['POST']);
		if( isset($params['pos']) && $params['pos'] == 1 ) {
			$this->product = new WooCommerce_POS_Product();
		}

		// error_log( print_R( $api_server, TRUE ) ); //debug
	}

	/**
	 * Get the woocommerce shop settings
	 * @return array $settings
	 */
	public function wc_settings() {
		$settings = array(
			'tax_label'				=> WC()->countries->tax_or_vat(), 
			'calc_taxes'			=> get_option( 'woocommerce_calc_taxes' ),
			'prices_include_tax'	=> get_option( 'woocommerce_prices_include_tax' ),
			'tax_round_at_subtotal'	=> get_option( 'woocommerce_tax_round_at_subtotal' ),
			'tax_display_cart'		=> get_option( 'woocommerce_tax_display_cart' ),
			'tax_total_display'		=> get_option( 'woocommerce_tax_total_display' ),
		);
		return $settings;
	}

	/**
	 * Get the default customer
	 * @return object $customer
	 */
	public function get_default_customer() {
		$id 	= get_option( 'woocommerce_pos_default_customer', 0 );
		$user 	= get_userdata( $id );
		if( $user ) {
			$first_name = esc_html( $user->first_name );
			$last_name 	= esc_html( $user->last_name );
			$name		= $first_name .' '. $last_name;
			if ( trim($name) == '' ) $name = esc_html( $user->display_name );
		} else {
			$name = __( 'Guest', 'woocommerce-pos' );
		}
		$customer = array(
			'default_id' => $id,
			'default_name' => $name
		);
		return $customer;
	}

	/**
	 * Get the accounting format from user settings
	 * POS uses a plugin to format currency: http://josscrowcroft.github.io/accounting.js/
	 * @return array $settings
	 */
	public function accounting_settings() {
		$decimal = get_option( 'woocommerce_price_decimal_sep' );
		$thousand = get_option( 'woocommerce_price_thousand_sep' );
		$precision = get_option( 'woocommerce_price_num_decimals' );
		$settings = array(
			'currency' => array(
				'decimal'	=> $decimal,  
				'format'	=> $this->currency_format(),
				'precision'	=> $precision,
				'symbol'	=> get_woocommerce_currency_symbol( get_woocommerce_currency() ),   
				'thousand'	=> $thousand,  
			),
			'number' => array(
				'decimal'	=> $decimal,
				'precision'	=> $precision,  
				'thousand'	=> $thousand,
			)
		);
		return $settings;
	}

	/**
	 * Get the currency format from user settings
	 * @return array $format
	 */
	public function currency_format() {
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
			default:
				$format = array('pos' => '%s%v', 'neg' => '- %s%v', 'zero' => '%s%v');
		}
		return $format;
	}


	public function select2_settings() {
		$settings = array(
			'no_matches'=> __( 'No matches found', 'woocommerce-pos' ),
			'too_short'	=> __( 'Please enter 1 more character', 'woocommerce-pos' ),
			'too_shorts'=> __( 'Please enter %d more characters', 'woocommerce-pos' ),
			'too_long' 	=> __( 'Please delete 1 character', 'woocommerce-pos' ),
			'too_longs' => __( 'Please delete %d characters', 'woocommerce-pos' ),
			'too_big' 	=> __( 'You can only select 1 item', 'woocommerce-pos' ),
			'too_bigs' 	=> __( 'You can only select %d items', 'woocommerce-pos' ),
			'load_more' => __( 'Loading more results', 'woocommerce-pos' ).'&hellip;',
			'searching' => __( 'Searching', 'woocommerce-pos' ).'&hellip;'
		);
		return $settings;
	}

	/**
	 * Add variables for use by js scripts
	 * @return [type] [description]
	 */
	public function pos_localize_script() {

		$js_vars['page']		= $this->is_pos();
		$js_vars['ajax_url'] 	= admin_url( 'admin-ajax.php', 'relative' );
		$js_vars['wc_api_url']	= $this->wc_api_url;
		$js_vars['accounting'] 	= $this->accounting_settings();
		$js_vars['wc'] 			= $this->wc_settings();
		$js_vars['select'] 		= $this->select2_settings();
		$js_vars['customer'] 	= $this->get_default_customer();

		// switch for development
		if( $this->development ) {
			$js_vars['worker'] 	= $this->plugin_url .'public/assets/js/src/worker.js';
		} else {
			$js_vars['worker'] 	= $this->plugin_url .'public/assets/js/worker.min.js?ver='. self::VERSION;
		}

		$pos_params = '
		<script type="text/javascript">
		var pos_params = ' . json_encode($js_vars) . '
		</script>
		';
		return $pos_params;
	}
	
	/**
	 * Print the CSS for public facing templates
	 */
	public function pos_print_css() {
		$html = '
	<link rel="stylesheet" href="'. $this->plugin_url .'public/assets/css/pos.min.css?ver='. self::VERSION .'" type="text/css" />
	<link rel="stylesheet" href="'. $this->plugin_url .'assets/css/font-awesome.min.css" type="text/css" />
		';
		echo $html;
	}

	/**
	 * Print the head JS for public facing templates
	 */
	public function pos_print_js ($section = '') {
		if($section == 'head') {
			$html = '
	<!-- Modernizr: checks: indexeddb, websql, localstrorage and CSS 3D transforms -->
	<script src="'. $this->plugin_url .'public/assets/js/vendor/modernizr.custom.min.js"></script>
			';
			echo $html;
		}
		if($section == 'footer') {
			do_action( 'pos_add_to_footer' );
			echo $this->pos_localize_script();

			$html = '
	<script src="//code.jquery.com/jquery-'. self::JQUERY_VERSION .'.min.js"></script>
	<script>window.jQuery || document.write(\'<script src="'. $this->plugin_url .'public/assets/js/vendor/jquery-2.1.1.min.js">\x3C/script>\')</script>	
	<script src="'. $this->plugin_url .'public/assets/js/plugins.min.js?ver='. self::VERSION .'"></script>
			';
			echo $html;

			// only include the app js on main page
			if( $this->is_pos() == 'main' ) {

				// switch for development
				if( $this->development ) {
					echo '<script data-main="'. $this->plugin_url .'public/assets/js/main" src="'. $this->plugin_url .'public/assets/js/require.js"></script>';
				} else {
					echo '<script src="'. $this->plugin_url .'public/assets/js/pos.min.js?ver='. self::VERSION .'"></script>';
				}
			}

			// include support.js on support page
			elseif ( $this->is_pos() == 'support' ) {
				echo '<script src="'. $this->plugin_url .'public/assets/js/support.min.js?ver='. self::VERSION .'"></script>';
			}
		}
	}

}