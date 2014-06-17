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
	 * @since    0.0.1
	 *
	 * @var      object
	 */
	protected static $instance = null;

	/**
	 * Slug of the plugin screen.
	 *
	 * @since    0.0.1
	 *
	 * @var      string
	 */
	protected $plugin_screen_hook_suffix = null;

	/**
	 * Plugin variables
	 */
	public $notices = array(); 	// stores any admin messages

	/**
	 * Initialize the plugin by loading admin scripts & styles and adding a
	 * settings page and menu.
	 *
	 * @since     0.0.1
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

		/*
		 * Call $plugin_slug from public plugin class.
		 */
		$this->plugin_slug = WC_POS()->get_plugin_slug();

		// Load admin style sheet and JavaScript.
		// add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		// add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		// check version
		add_action('admin_init', array( $this, 'run_checks') );

		// add the options page and menu item.
		add_action( 'admin_menu', array( $this, 'add_plugin_admin_menu' ) );

		// add any admin notices
		add_action( 'admin_notices', array( $this, 'admin_notices' ) );

		// Add an action link pointing to the options page.
		$plugin_basename = plugin_basename( plugin_dir_path( realpath( dirname( __FILE__ ) ) ) . $this->plugin_slug . '.php' );
		add_filter( 'plugin_action_links_' . $plugin_basename, array( $this, 'add_action_links' ) );

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
		$administrator->add_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		$shop_manager->add_cap( 'manage_woocommerce_pos' );
	}

	/**
	 * Fired when the plugin is deactivated.
	 */
	public static function single_deactivate() {
		// can not remove rewrite rule on deactivation AFAIK

		// remove the manage_woocommerce_pos capability to administrator and shop_manager
		$administrator = get_role( 'administrator' );
		$administrator->remove_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		$shop_manager->remove_cap( 'manage_woocommerce_pos' );

		// flush on activation and deactivation
		flush_rewrite_rules( false ); // false will not overwrite .htaccess
	}

	function run_checks() {
		$this->woocommerce_check();
		$this->permalink_check();
		$this->version_check();
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
	 * Register and enqueue admin-specific style sheet.
	 */
	public function enqueue_admin_styles() {

		if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $this->plugin_screen_hook_suffix == $screen->id ) {
			wp_enqueue_style( $this->plugin_slug .'-admin-styles', plugins_url( 'assets/css/admin.css', __FILE__ ), array(), WooCommerce_POS::VERSION );
		}

	}

	/**
	 * Register and enqueue admin-specific JavaScript.
	 */
	public function enqueue_admin_scripts() {

		if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $this->plugin_screen_hook_suffix == $screen->id ) {
			wp_enqueue_script( $this->plugin_slug . '-admin-script', plugins_url( 'assets/js/admin.js', __FILE__ ), array( 'jquery' ), WooCommerce_POS::VERSION );
		}

	}

	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 */
	public function add_plugin_admin_menu() {

		$this->plugin_screen_hook_suffix = add_options_page(
			__( 'WooCommerce POS', $this->plugin_slug ),
			__( 'WooCommerce POS', $this->plugin_slug ),
			'manage_options',
			$this->plugin_slug,
			array( $this, 'display_plugin_admin_page' )
		);

	}

	/**
	 * Render the settings page for this plugin.
	 */
	public function display_plugin_admin_page() {
		include_once( 'views/admin.php' );
	}

	/**
	 * Add settings action link to the plugins page.
	 */
	public function add_action_links( $links ) {

		return array_merge(
			array(
				'settings' => '<a href="' . admin_url( 'options-general.php?page=' . $this->plugin_slug ) . '">' . __( 'Settings', $this->plugin_slug ) . '</a>',
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

}
