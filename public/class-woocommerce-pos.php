<?php
/**
 * Plugin Name.
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @license   GPL-2.0+
 * @link      http://example.com
 * @copyright 2013 Your Name or Company Name
 */

/**
 * Plugin class. This class should ideally be used to work with the
 * public-facing side of the WordPress site.
 *
 * If you're interested in introducing administrative or dashboard
 * functionality, then refer to `class-woocommerce-pos-admin.php`
 *
 * @package WooCommerce POS
 * @author  Paul Kilmurray <paul@kilbot.com.au>
 */
class WooCommerce_POS {

	/**
	 * Version numbers
	 */
	const VERSION 			= '0.2';
	const JQUERY 			= '1.10.2'; // http://jquery.com/
	const JQUERY_MOBILE 	= '1.4.2'; 	// http://jquerymobile.com/
	const JQUERY_DATATABLES = '1.10.0-beta.2'; 	// https://datatables.net/

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
	 * Initialize the plugin
	 */
	private function __construct() {
		$this->plugin_path = trailingslashit( dirname( dirname(__FILE__) ) );
		$this->plugin_dir = trailingslashit( basename( $this->plugin_path ) );
		$this->plugin_url = plugins_url().'/'.$this->plugin_dir;

		// Load plugin text domain
		//add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
		
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
	}

	/**
	 * Fired when the plugin is deactivated.
	 */
	public static function deactivate( ) {
		// nothing at the moment
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
		if ($custom_page == 'pos' && current_user_can('manage_options')) {
			// we've found our page, call render_page and exit
			$this->render_page();
			exit;
		} elseif ($custom_page == 'pos' && !current_user_can('manage_options')) {
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
		if(!empty($_POST['pos_checkout']) && !wp_verify_nonce($_POST['woocommerce-pos_checkout'],'woocommerce-pos_checkout')) {
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
		} else {
			// we're in the chopping cart
			if (!defined( 'WOOCOMMERCE_CART')) define( 'WOOCOMMERCE_CART', true );
			$this->set_local_pickup();
			include_once( 'views/pos.php' );
		}
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
	 * Get all products, ordered by recent best sellers
	 * @return array
	 */
	public function get_all_products() {
		// get array of all products and variations, set to zero sales
		$args = array(
			'post_type'			=> array('product', 'product_variation'),
			'post_status' 		=> array('private', 'publish'),
			'posts_per_page' 	=> -1,
			'fields'			=> 'ids'
		);
		$products = get_posts( $args );
		$zero_sales = array();
		if($products) {
			foreach( $products as $product ) {
				$zero_sales[ $product ] = 0;
			}
		}
		
		// combine with best selling products and variations
		$product_sales = $this->get_best_sellers();
		$variation_sales = $this->get_best_sellers(array('product_id'=>'_variation_id'));
		$all_sales = $variation_sales + $product_sales + $zero_sales;
		
		// sort array and return best selling products and variations
		asort( $all_sales );
		$best_sellers = array_reverse( $all_sales, true );

		return $best_sellers;
	}
	
	/**
	 * Get best sellers from the last 30 days
	 * @param  array $args
	 * @return array
	 */
	public function get_best_sellers($args='') {
		global $wpdb;
		
		$defaults = array(
			'start_date'	=> date( 'Ymd', strtotime( '-30 days' ) ),
			'end_date'		=> date( 'Ymd', current_time( 'timestamp' ) ),
			'order_statuses'=> array( 'completed', 'processing', 'on-hold' ),
			'product_id' 	=> '_product_id'
		);

		$args = wp_parse_args( $args, $defaults );

		extract( $args );
		
		$start_date = strtotime( $start_date );
		$end_date = strtotime( $end_date );
		$order_statuses = implode("','", $order_statuses);
		
		$order_items = $wpdb->get_results("
			SELECT order_item_meta_2.meta_value as product_id, SUM( order_item_meta.meta_value ) as item_quantity FROM {$wpdb->prefix}woocommerce_order_items as order_items
			LEFT JOIN {$wpdb->prefix}woocommerce_order_itemmeta as order_item_meta ON order_items.order_item_id = order_item_meta.order_item_id
			LEFT JOIN {$wpdb->prefix}woocommerce_order_itemmeta as order_item_meta_2 ON order_items.order_item_id = order_item_meta_2.order_item_id
			LEFT JOIN {$wpdb->posts} AS posts ON order_items.order_id = posts.ID
			LEFT JOIN {$wpdb->term_relationships} AS rel ON posts.ID = rel.object_ID
			LEFT JOIN {$wpdb->term_taxonomy} AS tax USING( term_taxonomy_id )
			LEFT JOIN {$wpdb->terms} AS term USING( term_id )
			WHERE 	posts.post_type 	= 'shop_order'
			AND 	posts.post_status 	= 'publish'
			AND 	tax.taxonomy		= 'shop_order_status'
			AND		term.slug			IN ('" . $order_statuses . "')
			AND 	post_date > '" . date('Y-m-d', $start_date ) . "'
			AND 	post_date < '" . date('Y-m-d', strtotime('+1 day', $end_date ) ) . "'
			AND 	order_items.order_item_type = 'line_item'
			AND 	order_item_meta.meta_key = '_qty'
			AND 	order_item_meta_2.meta_key = '" . $product_id . "'
			GROUP BY order_item_meta_2.meta_value
		");
		
		$found_products = array();

		if ( $order_items ) {
			foreach ( $order_items as $order_item ) {
				if($order_item->product_id) $found_products[ $order_item->product_id ] = $order_item->item_quantity;
			}
		}
		
		return $found_products;
	}
	
	/**
	 * Remove required fields so we process cart with out address
	 * @param  array $address_fields
	 * @return array
	 */
	public function pos_remove_required_fields( $address_fields ) {
		$address_fields['billing_first_name']['required'] = false;
		$address_fields['billing_last_name']['required'] = false;
		$address_fields['billing_company']['required'] = false;
		$address_fields['billing_address_1']['required'] = false;
		$address_fields['billing_address_2']['required'] = false;
		$address_fields['billing_city']['required'] = false;
		$address_fields['billing_postcode']['required'] = false;
		$address_fields['billing_country']['required'] = false;
		$address_fields['billing_state']['required'] = false;
		$address_fields['billing_email']['required'] = false;
		$address_fields['billing_phone']['required'] = false;
		return $address_fields;
	}
	
	/**
	 * After order has been processed successfully
	 * @param  int $order_id
	 * @param  [type] $posted
	 */
	public function pos_order_processed($order_id, $posted) {
		if(!empty($_POST['pos_receipt']) && !wp_verify_nonce($_POST['woocommerce-pos_receipt'],'woocommerce-pos_receipt')) {
			global $order_id;
			WC()->cart->empty_cart();
			exit;
		} else {
			return;
		}
	}
	
	/**
	 * Get Add to Cart link for POS
	 * @param  object $product
	 */
	public function get_pos_add_to_cart_url($product) {
		if ( $product->is_type('variation') ) {
			$url = remove_query_arg( 'added-to-cart', add_query_arg( array_merge( array( 'variation_id' => $product->variation_id, 'add-to-cart' => $product->id ), $product->variation_data ) ) );
		} else {
			$url = remove_query_arg( 'added-to-cart', add_query_arg( 'add-to-cart', $product->id ) );
		}
		echo apply_filters( 'woocommerce_product_add_to_cart_url', $url, $product );
	}

	/**
	 * Print the CSS for public facing templates
	 * @return [type] [description]
	 */
	public function pos_print_css() {
		echo '
		<link rel="stylesheet" href="//code.jquery.com/mobile/'.self::JQUERY_MOBILE.'/jquery.mobile-'.self::JQUERY_MOBILE.'.min.css" type="text/css" media="all" />
		<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/'.self::JQUERY_DATATABLES.'/css/jquery.dataTables.css">
		<link rel="stylesheet" href="'. $this->plugin_url .'/public/assets/css/pos.css" type="text/css" media="all" />
		';
	}

	/**
	 * Print the head JS for public facing templates
	 * @return [type] [description]
	 */
	public function pos_print_js_head () {
		echo '
		<script src="//ajax.googleapis.com/ajax/libs/jquery/'.self::JQUERY.'/jquery.min.js"></script>
		<script type="text/javascript">
		$(document).bind("mobileinit", function () {
		    $.mobile.ajaxEnabled = false;
		});
		</script>
		<script src="//code.jquery.com/mobile/'.self::JQUERY_MOBILE.'/jquery.mobile-'.self::JQUERY_MOBILE.'.min.js"></script>
		<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/'.self::JQUERY_DATATABLES.'/js/jquery.dataTables.js"></script>
		';
	}	
}