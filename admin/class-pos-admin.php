<?php

/**
 * WP Admin Class
 * 
 * @class 	  WooCommerce_POS_Admin
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Admin {

	/**
	 * Instance of this class.
	 *
	 * @var      object
	 */
	protected static $instance = null;

	/**
	 * Plugin variables
	 */
	public $notices = array(); 	// stores any admin messages

	/**
	 * Initialize the plugin by loading admin scripts & styles and adding a
	 * settings page and menu.
	 */
	private function __construct() {

		/*
		 * @TODO :
		 *
		 * - Uncomment following lines if the admin class should only be available for super admins
		 */
		/* if( ! is_super_admin() ) {
			return;
		} */

		// Activate plugin when new blog is added
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

		// Call $plugin_slug from public plugin class.
		$this->plugin_slug = WC_POS()->get_plugin_slug();

		// includes 
		add_action( 'init', array( $this, 'includes' ) );

		// checks
		add_action( 'admin_init', array( $this, 'run_checks' ) );

		// add pos_params to admin head
		add_action('admin_head', array( $this, 'admin_head' ) );

		// add the options page and menu item.
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );

		// add any admin notices
		add_action( 'admin_notices', array( $this, 'admin_notices' ) );

		// Add an action link pointing to the options page.
		$plugin_basename = plugin_basename( plugin_dir_path( realpath( dirname( __FILE__ ) ) ) . $this->plugin_slug . '.php' );
		add_filter( 'plugin_action_links_' . $plugin_basename, array( $this, 'add_action_links' ) );

				// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

	}

	/**
	 * Return an instance of this class.
	 */
	public static function get_instance() {

		/*
		 * @TODO :
		 *
		 * - Uncomment following lines if the admin class should only be available for super admins
		 */
		/* if( ! is_super_admin() ) {
			return;
		} */

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * includes
	 */
	public function includes() {

		include_once( 'includes/class-pos-admin-hooks.php' );
		include_once( 'includes/class-pos-product-admin.php' );
	}

	/**
	 * Fired when the plugin is activated.
	 */
	public static function activate( $network_wide ) {

		if ( function_exists( 'is_multisite' ) && is_multisite() ) {

			if ( $network_wide  ) {

				// Get all blog ids
				$blog_ids = self::get_blog_ids();

				foreach ( $blog_ids as $blog_id ) {

					switch_to_blog( $blog_id );
					self::single_activate();

					restore_current_blog();
				}

			} else {
				self::single_activate();
			}

		} else {
			self::single_activate();
		}

	}

	/**
	 * Fired when the plugin is deactivated.
	 */
	public static function deactivate( $network_wide ) {

		if ( function_exists( 'is_multisite' ) && is_multisite() ) {

			if ( $network_wide ) {

				// Get all blog ids
				$blog_ids = self::get_blog_ids();

				foreach ( $blog_ids as $blog_id ) {

					switch_to_blog( $blog_id );
					self::single_deactivate();

					restore_current_blog();

				}

			} else {
				self::single_deactivate();
			}

		} else {
			self::single_deactivate();
		}

	}

	/**
	 * Fired when a new site is activated with a WPMU environment.
	 */
	public function activate_new_site( $blog_id ) {

		if ( 1 !== did_action( 'wpmu_new_blog' ) ) {
			return;
		}

		switch_to_blog( $blog_id );
		self::single_activate();
		restore_current_blog();

	}

	/**
	 * Get all blog ids of blogs in the current network that are:
	 * - not archived
	 * - not spam
	 * - not deleted
	 */
	private static function get_blog_ids() {

		global $wpdb;

		// get an array of blog ids
		$sql = "SELECT blog_id FROM $wpdb->blogs
			WHERE archived = '0' AND spam = '0'
			AND deleted = '0'";

		return $wpdb->get_col( $sql );

	}

	/**
	 * Fired when the plugin is activated.
	 */
	public static function single_activate() {

		// Add rewrite rules, $this->generate_rewrite_rules not called on activation
		global $wp_rewrite;
		add_rewrite_rule('^pos/?$','index.php?pos=1','top');
		add_rewrite_rule('^pos/([^/]+)/?$','index.php?pos=1&pos_template=$matches[1]','top');
		flush_rewrite_rules( false ); // false will not overwrite .htaccess

		// add the manage_woocommerce_pos capability to administrator and shop_manager
		$administrator = get_role( 'administrator' );
		if( $administrator ) 
			$administrator->add_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		if( $shop_manager ) 
			$shop_manager->add_cap( 'manage_woocommerce_pos' );

		// set the auto redirection on next page load
		set_transient( 'woocommere_pos_welcome', 1, 30 );
		
	}

	/**
	 * Fired when the plugin is deactivated.
	 */
	public static function single_deactivate() {
		// can not remove rewrite rule on deactivation AFAIK

		// remove the manage_woocommerce_pos capability to administrator and shop_manager
		$administrator = get_role( 'administrator' );
		if( $administrator ) 
			$administrator->remove_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		if( $shop_manager ) 
			$shop_manager->remove_cap( 'manage_woocommerce_pos' );

		// flush on activation and deactivation
		flush_rewrite_rules( false ); // false will not overwrite .htaccess
	}

	function run_checks() {
		$this->version_check();
		$this->woocommerce_check();
		$this->permalink_check();
		$this->welcome_screen();
		$this->gateway_check();
	}

	/**
	 * Check version number, runs every time
	 * Also cehcks to make sure WooCommerce is active
	 */
	public function version_check(){
		// next check the POS version number
		$old = get_option( 'woocommerce_pos_db_version' );
		if( !$old || $old != WooCommerce_POS::VERSION ) {
			$this->upgrade( $old );
			update_option( 'woocommerce_pos_db_version', WooCommerce_POS::VERSION );
		}
	}

	/**
	 * Check if WooCommerce is active, deactivate POS if no woo
	 */
	public function woocommerce_check() {
		if ( ! class_exists( 'WooCommerce' ) ) {

			// deactivate plugin
			if( function_exists('deactivate_plugins')) 
				deactivate_plugins(WC_POS()->plugin_path. 'woocommerce-pos.php');

			// alert the user
			$error = array (
				'msg_type' 	=> 'error',
				'msg' 		=> __('<strong>WooCommerce POS</strong> requires <a href="http://wordpress.org/plugins/woocommerce/">WooCommerce</a>. Please install and activate WooCommerce before activating WooCommerce POS.', 'woocommerce-pos')
			);
			array_push( $this->notices, $error );
		}
	}

	/**
	 * Check if permalinks enabled, WC API needs permalinks
	 */
	public function permalink_check() {
		global $wp_rewrite; 
		if( $wp_rewrite->permalink_structure == '' ) {

			// alert the user
			$error = array (
				'msg_type' 	=> 'error',
				'msg' 		=> sprintf( __('<strong>WooCommerce REST API</strong> requires <em>pretty</em> permalinks to work correctly. Please enable <a href="%s">permalinks</a>.', 'woocommerce-pos'), admin_url('options-permalink.php') )
			);
			array_push( $this->notices, $error );
		}
	}

	/**
	 * Upgrade from previous versions
	 */
	public function upgrade( $old ) {

		// flush rewrite rules on upgrade
		flush_rewrite_rules( false );

	}

	/**
	 * Show welcome screen after activation
	 */
	public function welcome_screen() {
		// only do this if the user can activate plugins
        if ( ! current_user_can( 'manage_options' ) )
            return;
 
        // don't do anything if the transient isn't set
        if ( ! get_transient( 'woocommere_pos_welcome' ) )
            return;
 
        delete_transient( 'woocommere_pos_welcome' );
        wp_safe_redirect( admin_url( 'admin.php?page=woocommerce-pos') );
        exit;
	}

	/**
	 * Set default Payment Gateways if not set already
	 */
	public function gateway_check() {
		$defaults = array( 'pos_cash', 'pos_card', 'paypal' );
		if( !get_option('woocommerce_pos_default_gateway') ) 
			update_option( 'woocommerce_pos_default_gateway', 'pos_cash' );
		if( $enabled = get_option('woocommerce_pos_enabled_gateways' ) ) {
			update_option( 'woocommerce_pos_enabled_gateways', array_intersect( $enabled, $defaults ) );
		} elseif( false === $enabled ) {
			update_option( 'woocommerce_pos_enabled_gateways', array_slice( $defaults, 0, -1 ) );
		}
	}

	/**
	 * Register and enqueue admin-specific style sheet.
	 */
	public function enqueue_admin_styles() {

		$screen = get_current_screen();

		if ( in_array( $screen->id, $this->screen_ids() ) ) {
			wp_enqueue_style( $this->plugin_slug .'-admin', plugins_url( 'assets/css/admin.min.css', __FILE__ ), array(), WooCommerce_POS::VERSION );
			wp_enqueue_style( 'woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css', array(), WC_VERSION );
		}

		if ( in_array( $screen->id, $this->screen_ids() ) ) {
			$css = '
				table.wc_gateways .pos_status, table.wc_gateways .pos_enabled { text-align: center; }
				table.wc_gateways .pos_status .tips, table.wc_gateways .pos_enabled .tips { margin: 0 auto; }
				.status-disabled:before { font-family:WooCommerce; speak:none; font-weight:400; font-variant:normal; text-transform:none; line-height:1; -webkit-font-smoothing:antialiased; margin:0; text-indent:0; position:absolute; top:0;left:0; width:100%; height:100%; text-align:center; content: "\e602"; color:#E0E0E0; }
			';
			wp_add_inline_style( 'wp-admin', $css );
		}

		wp_enqueue_style( $this->plugin_slug .'-dashicons', plugins_url( 'assets/css/dashicons.min.css', __FILE__ ), array(), WooCommerce_POS::VERSION );
		
	}

	/**
	 * Register and enqueue admin-specific JavaScript.
	 */
	public function enqueue_admin_scripts() {

		$screen = get_current_screen();

		if ( in_array( $screen->id, $this->screen_ids() ) ) {
			wp_enqueue_script( $this->plugin_slug . '-admin-script', plugins_url( 'assets/js/admin.min.js', __FILE__ ), array( 'jquery' ), WooCommerce_POS::VERSION );
		
			// register WC scripts
			wp_register_script( 'woocommerce_admin', WC()->plugin_url() . '/assets/js/admin/woocommerce_admin.min.js', array( 'jquery', 'jquery-blockui', 'jquery-ui-sortable', 'jquery-ui-widget', 'jquery-ui-core', 'jquery-tiptip' ), WC_VERSION );
			wp_register_script( 'jquery-blockui', WC()->plugin_url() . '/assets/js/jquery-blockui/jquery.blockUI.min.js', array( 'jquery' ), '2.66', true );
			wp_register_script( 'jquery-tiptip', WC()->plugin_url() . '/assets/js/jquery-tiptip/jquery.tipTip.min.js', array( 'jquery' ), WC_VERSION, true );
			wp_register_script( 'ajax-chosen', WC()->plugin_url() . '/assets/js/chosen/ajax-chosen.jquery.min.js', array('jquery', 'chosen'), WC_VERSION );
			wp_register_script( 'chosen', WC()->plugin_url() . '/assets/js/chosen/chosen.jquery.min.js', array('jquery'), WC_VERSION );

			// enqueue WC scripts we are using
			wp_enqueue_script( 'woocommerce_admin' );
			wp_enqueue_script( 'jquery-tiptip' );
			wp_enqueue_script( 'ajax-chosen' );
	    	wp_enqueue_script( 'chosen' );
	    	wp_enqueue_script( 'jquery-ui-sortable' );
		}

		// js for product page
		if ( in_array( $screen->id, array( 'product' ) ) ) {
			wp_enqueue_script( $this->plugin_slug . '-admin-products', plugins_url( 'assets/js/products.min.js', __FILE__ ), array( 'jquery', 'backbone', 'underscore' ), WooCommerce_POS::VERSION );
		}

	}

	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 */
	public function admin_menu() {
		global $menu;
		global $submenu;

		if( !current_user_can( 'manage_woocommerce_pos' ) )
			return;

		add_menu_page( 
			__( 'POS', 'woocommerce-pos' ),
			__( 'POS', 'woocommerce-pos' ), 
			'manage_woocommerce_pos', 
			$this->plugin_slug, 
			array( $this, 'display_upgrade_page' ), 
			null, 
			56 
		);

		add_submenu_page(
			$this->plugin_slug,
			__( 'Settings', 'woocommerce-pos' ),
			__( 'Settings', 'woocommerce-pos' ),
			'manage_woocommerce_pos',
			'wc-pos-settings',
			array( $this, 'display_settings_page' )
		);

		$submenu[$this->plugin_slug][0][0] = __( 'Upgrade to Pro', 'woocommerce-pos' );
		$submenu[$this->plugin_slug][500] = array( __( 'View POS', 'woocommerce-pos' ), 'manage_woocommerce_pos' , WC_POS()->pos_url() ); 

	}

	/**
	 * An array of screen ids 
	 */
	public function screen_ids() {
		$pos_screen_id = sanitize_title( __( 'POS', 'woocommerce-pos' ) );

		$screen_ids = array(
			'toplevel_page_woocommerce-pos',
			$pos_screen_id . '_page_wc-pos-settings'
		);
		
		return apply_filters( 'woocommere_pos_screen_ids', $screen_ids );
	}

	/**
	 * Render the upgrade page.
	 */
	public function display_upgrade_page() {

		// Check for transient, if none, grab remote HTML file
		if ( false === ( $upgrade = get_transient( 'remote_pro_page' ) ) ) {
			// Get remote HTML file
			$response = wp_remote_get( 'http://woopos.com.au/pro/?wp-admin=woocommerce-pos' );
				// Check for error
				if ( is_wp_error( $response ) ) {
					return;
				}
			// Parse remote HTML file
			$upgrade = wp_remote_retrieve_body( $response );
				// Check for error
				if ( is_wp_error( $upgrade ) ) {
					return;
				}
			// Store remote HTML file in transient, expire after 24 hours
			set_transient( 'remote_pro_page', $upgrade, 24 * HOUR_IN_SECONDS );
		}
		include_once( 'views/upgrade.php' );
	}

	/**
	 * Render the settings page for this plugin.
	 */
	public function display_settings_page() {
		include_once( 'includes/class-pos-settings.php' );
		WC_POS_Admin_Settings::output();
	}

	/**
	 * Add settings action link to the plugins page.
	 */
	public function add_action_links( $links ) {

		return array_merge(
			array(
				'settings' => '<a href="' . admin_url( 'admin.php?page=' . $this->plugin_slug ) . '">' . __( 'Settings', $this->plugin_slug ) . '</a>',
				'view-pos' => '<a href="' . WC_POS()->pos_url() . '">' . __( 'View POS', $this->plugin_slug ) . '</a>'
			),
			$links
		);

	}

	/**
	 * Display the admin notices
	 */
	public function admin_notices() {
		if( !empty($this->notices ) ) {
			foreach( $this->notices as $notice ) {
				echo '<div class="' . $notice['msg_type'] . '">
					<p>' . $notice['msg'] . '</p>
				</div>';
			} 
		} 
	}

	/**
	 * Add pos_params global variable for js
	 */
	public function admin_head() {
		echo '<script type="text/javascript">window.pos_params={};</script>';
	}

}
