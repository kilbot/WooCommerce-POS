<?php

/**
 * Activation checks and set up
 *
 * @class 	  WooCommerce_POS_Pro_Activator
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_Activator {

	/* @var array Stores admin notices */
	private $notices = array();

	public function __construct() {

		// wpmu_new_blog
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

		// output any activation notices
		add_action( 'admin_notices', array( $this, 'admin_notices' ) );

		// check dependencies
		add_action( 'admin_init', array( $this, 'run_checks' ) );

	}

	/**
	 * Fired when the plugin is activated.
	 *
	 * @param $network_wide
	 */
	static public function activate( $network_wide ) {
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
	 * Fired when a new site is activated with a WPMU environment.
	 *
	 * @param $blog_id
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
	static private function get_blog_ids() {

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
	static public function single_activate() {

		// Add rewrite rules, $this->generate_rewrite_rules not called on activation
		global $wp_rewrite;
		$permalink = get_option( 'woocommerce_pos_settings_permalink' );
		$slug = $permalink && $permalink != '' ? $permalink : 'pos' ;
		add_rewrite_rule('^'. $slug .'/?$','index.php?pos=1','top');
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
	 * Check dependencies
	 */
	public function run_checks() {
		$this->woocommerce_check();
		$this->wc_api_check();
		$this->permalink_check();
	}

	/**
	 * Check if WooCommerce is active
	 */
	private function woocommerce_check() {
		if( ! current_user_can( 'activate_plugins' ) )
			return;

		$wc_active = function_exists( 'is_woocommerce_active' ) ? is_woocommerce_active() : $this->is_woocommerce_active() ;

		if ( ! $wc_active ) {

			// alert the user
			$error = array (
				'msg_type' 	=> 'error',
				'msg' 		=> sprintf( __('<strong>WooCommerce POS</strong> requires <a href="%s">WooCommerce</a>. Please <a href="%s">install and activate WooCommerce</a>', 'woocommerce-pos' ), 'http://wordpress.org/plugins/woocommerce/', admin_url('plugins.php') ) . ' &raquo;'
			);
			array_push( $this->notices, $error );
		}

	}

	/**
	 * Check if WooCommerce is in active_plugins
	 * @return bool
	 */
	private function is_woocommerce_active() {
		$active_plugins = (array) get_option( 'active_plugins', array() );

		if ( is_multisite() )
			$active_plugins = array_merge( $active_plugins, get_site_option( 'active_sitewide_plugins', array() ) );

		return in_array( 'woocommerce/woocommerce.php', $active_plugins ) || array_key_exists( 'woocommerce/woocommerce.php', $active_plugins );
	}

	/**
	 * Check if the WC API option is enabled
	 */
	private function wc_api_check() {
		if( ! current_user_can( 'manage_woocommerce' ) )
			return;

		if( get_option( 'woocommerce_api_enabled' ) !== 'yes' && ! isset( $_POST['woocommerce_api_enabled'] ) ) {

			// alert the user
			$error = array (
				'msg_type' 	=> 'error',
				'msg' 		=> sprintf( __('<strong>WooCommerce POS</strong> requires the WooCommerce REST API. Please <a href="%s">enable the REST API</a>', 'woocommerce-pos' ), admin_url('admin.php?page=wc-settings') ) . ' &raquo;'
			);
			array_push( $this->notices, $error );

		}
	}

	/**
	 * Check if permalinks enabled, WC API needs permalinks
	 */
	private function permalink_check() {
		global $wp_rewrite;
		if( $wp_rewrite->permalink_structure == '' ) {

			// alert the user
			$error = array (
				'msg_type' 	=> 'error',
				'msg' 		=> sprintf( __('<strong>WooCommerce REST API</strong> requires <em>pretty</em> permalinks to work correctly. Please <a href="%s">enable permalinks</a>.', 'woocommerce-pos'), admin_url('options-permalink.php') ) . ' &raquo;'
			);
			array_push( $this->notices, $error );
		}
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

// auto load this class for activation checks
new WC_POS_Activator();