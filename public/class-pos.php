<?php

/**
 * Frontend POS Class
 *
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
	const VERSION 			= '0.2.2';
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
	 * Initialize WooCommerce_POS
	 */
	private function __construct() {
		// include required files
		$this->includes();

		$this->plugin_path = trailingslashit( dirname( dirname(__FILE__) ) );
		$this->plugin_dir = trailingslashit( basename( $this->plugin_path ) );
		$this->plugin_url = plugins_url().'/'.$this->plugin_dir;

		// Load plugin text domain
		//add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
		add_action( 'init', array( $this, 'init' ), 0 );

		// Set up templates
		add_filter('generate_rewrite_rules', array( $this, 'pos_generate_rewrite_rules') );
		add_filter('query_vars', array( $this, 'pos_query_vars') );
		add_action('template_redirect', array( $this, 'pos_template_redirect') );
		
		add_action('pos_add_to_cart_url', array( $this, 'get_pos_add_to_cart_url'), 10, 1 );
		add_action('woocommerce_checkout_order_processed', array( $this, 'pos_order_processed'), 10, 2);
		
		// add ajax callback for product search
		//add_action('wp_ajax_product_search', array( $this, 'product_search_callback') );
		// change customer id
		//add_filter( 'woocommerce_checkout_customer_id', array( $this, 'pos_change_customer_id') );
		
		// AJAX method
		add_action( 'wp_ajax_pos_add_to_cart', array( $this, 'ajax_add_to_cart' ) );
		add_action( 'wp_ajax_nopriv_pos_add_to_cart', array( $this, 'ajax_add_to_cart' ) );
		add_action( 'wp_ajax_pos_remove_item', array( $this, 'ajax_remove_item' ) );
		add_action( 'wp_ajax_nopriv_pos_remove_item', array( $this, 'ajax_remove_item' ) );

		add_action( 'wp_ajax_get_products', array( $this, 'get_products_json' ) );
		add_action( 'wp_ajax_nopriv_get_products', array( $this, 'get_products_json' ) );
		add_action( 'wp_ajax_get_cart_fragment', array( $this, 'get_refreshed_fragments' ) );
		add_action( 'wp_ajax_nopriv_get_cart_fragment', array( $this, 'get_refreshed_fragments' ) );
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
	}

	public function init() {
		$this->product  = new WooCommerce_POS_Product();
		$this->cart     = new WooCommerce_POS_Cart();
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
	 * Redirect to POS templates
	 */
	public function pos_template_redirect() {
		// $pagename = $this->options['pagename']; TODO: set custom pagename as an option
		global $wp_query;
		$custom_page = isset($wp_query->query_vars['custom_page']) ? $wp_query->query_vars['custom_page'] : null;
		// make sure administrator has logged in
		if ($custom_page == 'pos' && current_user_can('manage_woocommerce_pos')) {
			// we've found our page, call render_page and exit
			
			$this->render_page();
			exit;
		} elseif ($custom_page == 'pos' && !current_user_can('manage_woocommerce_pos')) {
			// redirect to login page
			auth_redirect();
		}
	}

	/**
	 * Render the POS templates
	 * @return [type] [description]
	 */
	public function render_page() {
		global $woocommerce;
		if(!empty($_REQUEST['product']) && $_REQUEST['product'] == 'all' ):
			// page is asking for all products
			$this->product->get_all_products_json();
		elseif( !empty( $_POST['pos_checkout'] ) && !wp_verify_nonce( $_POST['woocommerce-pos_checkout'], 'woocommerce-pos_checkout') ) :
			if (!defined( 'WOOCOMMERCE_CHECKOUT')) define( 'WOOCOMMERCE_CHECKOUT', true );
			if ( sizeof( WC()->cart->get_cart() ) == 0 ) {
				include_once( 'views/pos.php' );
				exit;
			}
			add_filter( 'woocommerce_checkout_customer_id', 0 );
			add_filter( 'woocommerce_cart_needs_shipping', '__return_false' );
			add_filter( 'woocommerce_cart_needs_payment', '__return_false' );
			add_filter( 'woocommerce_billing_fields', array( $this, 'pos_remove_required_fields'), 10, 1 );
			add_filter( 'woocommerce_checkout_no_payment_needed_redirect', '__return_false' );
			include_once( 'views/receipt.php' );
			$woocommerce_checkout = WC()->checkout();
			$woocommerce_checkout->process_checkout();
		else :
			// we're in the chopping cart
			if (!defined( 'WOOCOMMERCE_CART')) define( 'WOOCOMMERCE_CART', true );
			$this->set_local_pickup();
			include_once( 'views/pos.php' );
		endif;
	}

	/**
	 * Force the shipping method to be local pickup, ie: instore purchase
	 */
	public function set_local_pickup() {
		$chosen_shipping_methods[0] = 'local_pickup';
		WC()->session->set( 'chosen_shipping_methods', $chosen_shipping_methods );
		WC()->cart->calculate_totals();
	}

	/**
	 * Add to cart handler for AJAX requests
	 * bit of a hack here: the native woo ajax only deals with single product ids
	 * we want to be able to add variations so we recreate the form handler from woocommerce
	 */
	public function ajax_add_to_cart() {
		global $woocommerce;

		$product_id 	= $_REQUEST['id'];
		$quantity 		= 1;
		$variation_id 	= isset($_REQUEST['variation_id']) ? $_REQUEST['variation_id'] : '' ;
		$variation 		= '';

		$added_to_cart = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation);
		if( !$added_to_cart ) {
			$this->json_headers();
			echo json_encode( array ( 'error' => true, 'msg' => 'There was a problem adding the item to the cart' ) );
			die();
		} else {
			$this->get_refreshed_fragments();
		}
	}

	/**
	 * Remove from cart handler for AJAX requests
	 */
	public function ajax_remove_item() {
		global $woocommerce;

		$href = $_POST['href'];
		parse_url( $href, PHP_URL_QUERY );
		parse_str( parse_url($href, PHP_URL_QUERY ), $query_arr);

		if( !isset( $query_arr['remove_item'] ) && isset( $query_arr['_wpnonce'] ) && wp_verify_nonce( $query_arr['_wpnonce'], 'woocommerce-cart' ) ) {
			$this->json_headers();
			echo json_encode( array( 'error' => true, 'msg' => 'There was no product to remove from cart' ) );
			die();	
		}

		WC()->cart->set_quantity( $query_arr['remove_item'], 0 );
		wc_add_notice( __( 'Cart updated.', 'woocommerce' ) );
		$this->get_refreshed_fragments();
	}

	/**
	 * Output headers for JSON requests
	 */
	private function json_headers() {
		header( 'Content-Type: application/json; charset=utf-8' );
	}


	/**
	 * Get a refreshed cart fragment
	 */
	public function get_refreshed_fragments() {
		global $woocommerce;

		$this->json_headers();

		// Get mini cart
		ob_start();

		include_once( 'views/cart.php' );

		$cart = ob_get_clean();

		// Fragments and mini cart are returned
		$data = array(
			'fragments' => $cart,
			'cart_hash' => WC()->cart->get_cart() ? md5( json_encode( WC()->cart->get_cart() ) ) : ''
		);

		echo json_encode( $data );

		die();
	}

	public function get_products_json() {
		$this->json_headers();

		// set up the product data
		$products = $this->product->get_all_products();
		$total = count($products);

		if($products) {
			$data = array(
				'status' 		=> 'success',
				'total_count'	=> $total,
				'products'			=> $products
			);
		}
		else {
			// throw error
			$data = array(
				'status' => 'error',
			);
		}
		echo json_encode( $data );
		die();
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
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/mediator.js"></script>
	<script type="text/javascript">
	var mediator = new Mediator();
	</script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/underscore.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/backbone.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/backbone-pageable.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/backgrid.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/backgrid-paginator.js"></script>
	<script type="text/javascript" charset="utf8" src="'. $this->plugin_url .'/public/assets/js/lib/backgrid-filter.js"></script>
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
		;
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

/**
 * Returns main instance
 */
function WC_POS() {
	return WooCommerce_POS::get_instance();
}