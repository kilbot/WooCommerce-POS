<?php

/**
 * WP Admin Class
 * 
 * @class 	  WooCommerce_POS_Admin
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Pro_Admin {

	/**
	 * Instance of this class.
	 */
	protected static $instance = null;

	/**
	 * Self Upgrade Values
	 */
	// Base URL to the remote upgrade API Manager server. If not set then the Author URI is used.
	// Update Activation Hook if you change any of these
	public $upgrade_url = 'http://woopos.com.au';
	public $db_version_key = 'woocommerce_pos_pro_db_version';

	/**
	 * Data defaults
	 * @var mixed
	 */
	public $software_id;

	public $data_key;
	public $api_key;
	public $activation_email;
	public $product_id_key;
	public $instance_key;
	public $deactivate_checkbox_key;
	public $activated_key;

	public $options;
	public $plugin_name;
	public $product_id;
	public $renew_license_url;
	public $instance_id;
	public $domain;
	public $software_version;
	public $plugin_or_theme;
	public $update_version;
	public $update_check = 'woocommerce_pos_pro_update_check';

	/**
	 * Used to send any extra information.
	 * @var mixed array, object, string, etc.
	 */
	public $extra = '';

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

		// includes
		$this->includes();

		/*
		 * Call $plugin_slug from public plugin class.
		 */
		$this->plugin_slug = WC_POS_Pro()->get_plugin_slug();

		/*
		 * Text domain
		 */
		$this->text_domain = $this->plugin_slug;

		/**
		 * Software Product ID matches WooCommerce
		 */
		$this->software_id = 'WooCommerce POS Pro';

		/**
		 * Set data keys for wp options
		 * Update Activation Hook if you change any of these
		 */
		$this->data_key 				= 'woocommerce_pos_pro';
		$this->key 						= 'key';
		$this->activation_email 		= 'activation_email';
		$this->product_id_key 			= 'woocommerce_pos_pro_product_id';
		$this->instance_key 			= 'woocommerce_pos_pro_instance';
		$this->deactivate_checkbox_key 	= 'woocommerce_pos_pro_deactivate_checkbox';
		$this->activated_key 			= 'woocommerce_pos_pro_activated';

		/**
		 * Set all software update data here
		 */
		$this->options 				= get_option( $this->data_key );
		$this->plugin_name 			= $this->plugin_slug; // same as plugin slug. if a theme use a theme name like 'twentyeleven'
		$this->product_id 			= get_option( $this->product_id_key ); // Software Title
		$this->renew_license_url 	= 'http://woopos.com.au/my-account'; // URL to renew a license. Trailing slash in the upgrade_url is required.
		$this->instance_id 			= get_option( $this->instance_key ); // Instance ID (unique to each blog activation)
		$this->domain 				= site_url(); // blog domain name
		$this->software_version 	= WooCommerce_POS_Pro::VERSION; // The software version
		$this->plugin_or_theme 		= 'plugin'; // 'theme' or 'plugin'


		// Activate plugin when new blog is added
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

		// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		// add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		// check version
		add_action( 'admin_init', array( $this, 'run_checks' ) );

		// add pro settings
		add_action( 'current_screen', array( $this, 'add_settings' ) );

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
	 * File includes
	 */
	private function includes() {
		include_once( 'includes/class-pro-update.php' );
		include_once( 'includes/class-pro-admin-hooks.php' );
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
	 * Generate the default data arrays for license key
	 */
	public static function single_activate() {
		global $wpdb;

		$global_options = array(
			'key'				=> '',
			'activation_email' 	=> '',
		);

		update_option( 'woocommerce_pos_pro', $global_options );

		include_once( 'includes/class-pro-password.php' );

		$password = new WC_POS_Pro_Password();

		// Generate a unique installation $instance id
		$instance = $password->generate_password( 12, false );

		$single_options = array(
			'woocommerce_pos_pro_product_id' => 'WooCommerce POS Pro',
			'woocommerce_pos_pro_instance' 	 => $instance,
			'woocommerce_pos_pro_activated'  => 'Deactivated',
		);

		foreach ( $single_options as $key => $value ) {
			update_option( $key, $value );
		}

		$curr_ver = get_option( 'woocommerce_pos_pro_db_version' );

		// checks if the current plugin version is lower than the version being installed
		if ( version_compare( WooCommerce_POS_Pro::VERSION, $curr_ver, '>' ) ) {
			// update the version
			update_option( 'woocommerce_pos_pro_db_version', WooCommerce_POS_Pro::VERSION );
		}
	}

	/**
	 * Fired when the plugin is deactivated.
	 */
	public static function single_deactivate() {

		foreach ( array(
			'woocommerce_pos_pro',
			'woocommerce_pos_pro_product_id',
			'woocommerce_pos_pro_instance',
			'woocommerce_pos_pro_activated',
			'woocommerce_pos_pro_enabled_gateways'
		) as $option) {
			delete_option( $option );
		}

	}

	/**
	 * run checks
	 * @return [type] [description]
	 */
	public function run_checks() {

		$this->woocommerce_pos_check();
		$this->update_check();
		$this->check_external_blocking();

	}

	/**
	 * Check if WooCommerce POS is active, deactivate PRO if no woo
	 */
	public function woocommerce_pos_check() {
		if ( ! class_exists( 'WooCommerce_POS' ) ) {

			// deactivate plugin
			deactivate_plugins( WC_POS_Pro()->plugin_path. 'woocommerce-pos-pro.php' );

			// alert the user
			$error = array (
				'msg_type' 	=> 'error',
				'msg' 		=> __('<strong>WooCommerce POS Pro</strong> requires <a href="http://wordpress.org/plugins/woocommerce-pos/">WooCommerce POS</a>. Please install and activate WooCommerce POS before activating WooCommerce POS Pro.', 'woocommerce-pos')
			);
			array_push( $this->notices, $error );
		}
	}

	/**
	 * [update_check description]
	 * @return [type] [description]
	 */
	public function update_check() {

		// get options
		$options = get_option( $this->data_key );

		/**
		 * Check for software updates
		 */
		if ( ! empty( $options ) && $options !== false ) {

			WC_POS_Pro_Update_Check::instance(
				$this->upgrade_url,
				$this->plugin_name,
				$this->product_id,
				$this->options[$this->key],
				$this->options[$this->activation_email],
				$this->renew_license_url,
				$this->instance_id,
				$this->domain,
				$this->software_version,
				$this->plugin_or_theme,
				$this->text_domain,
				$this->extra
			);

		}
	}

	/**
	 * Check for external blocking contstant
	 * @return string
	 */
	public function check_external_blocking() {
		// show notice if external requests are blocked through the WP_HTTP_BLOCK_EXTERNAL constant
		if( defined( 'WP_HTTP_BLOCK_EXTERNAL' ) && WP_HTTP_BLOCK_EXTERNAL === true ) {

			// check if our API endpoint is in the allowed hosts
			$host = parse_url( $this->upgrade_url, PHP_URL_HOST );

			if( ! defined( 'WP_ACCESSIBLE_HOSTS' ) || stristr( WP_ACCESSIBLE_HOSTS, $host ) === false ) {
				?>
				<div class="error">
					<p><?php printf( __( '<b>Warning!</b> You\'re blocking external requests which means you won\'t be able to get %s updates. Please add %s to %s.', 'api-manager-example' ), $this->software_product_id, '<strong>' . $host . '</strong>', '<code>WP_ACCESSIBLE_HOSTS</code>'); ?></p>
				</div>
				<?php
			}

		}
	}

	// /**
	//  * Check version number, runs every time
	//  * Also cehcks to make sure WooCommerce is active
	//  */
	// public function version_check(){
	// 	// next check the POS version number
	// 	$old = get_option( 'woocommerce_pos_pro_db_version' );
	// 	if( !$old || $old != WooCommerce_POS_Pro::VERSION ) {
	// 		$this->upgrade( $old );
	// 		update_option( 'woocommerce_pos_pro_db_version', WooCommerce_POS_Pro::VERSION );
	// 	}
	// }

	// /**
	//  * Upgrade from previous versions
	//  */
	// public function upgrade( $old ) {

	// }

	/**
	 * Register and enqueue admin-specific style sheet.
	 */
	public function enqueue_admin_styles() {
		$screen = get_current_screen();

		if( in_array( $screen->id, $this->screen_ids() ) ) {
			$css = '
				table.wc_gateways .pro_status, table.wc_gateways .pro_enabled  { text-align: center; }
				table.wc_gateways .pro_status .tips, table.wc_gateways .pro_enabled .tips { margin: 0 auto; }
			';
			wp_add_inline_style( 'wp-admin', $css );
		}

	}

	/**
	 * Register and enqueue admin-specific JavaScript.
	 */
	public function enqueue_admin_scripts() {
		$screen = get_current_screen();

	}

	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 */
	public function add_settings( $current_screen ) {

		// if POS 
		if( ! class_exists( 'WooCommerce_POS_Admin' ) ) 
			return;

		$screen = get_current_screen();

		// if we're in the POS settings, add Pro settings
		if( in_array( $screen->id, $this->screen_ids() )  ) {
			include_once( 'includes/class-pro-settings.php' );
		}
	}

	/**
	 * An array of screen ids 
	 */
	public function screen_ids() {
		$pos_screen_id = sanitize_title( __( 'POS', 'woocommerce-pos' ) );

		$screen_ids = array(
			'toplevel_page_' . $pos_screen_id,
			$pos_screen_id . '_page_wc-pos-settings'
		);
		
		return apply_filters( 'woocommere_pos_screen_ids', $screen_ids );
	}

	/**
	 * Add settings action link to the plugins page.
	 */
	public function add_action_links( $links ) {

		return array_merge(
			array(
				'settings' => '<a href="' . admin_url( 'admin.php?page=wc-pos-settings' ) . '">' . __( 'Settings', $this->plugin_slug ) . '</a>',
				'pro-support' => '<a href="mailto:pro@woopos.com.au">' . __( 'Pro Support', $this->plugin_slug ) . '</a>',
			),
			$links
		);

	}

	/**
     * Displays an inactive notice when the software is inactive.
     */
	public static function inactive_notice() { ?>
		<?php if ( ! current_user_can( 'manage_options' ) ) return; ?>
		<?php if ( isset( $_GET['page'] ) && isset( $_GET['tab'] ) && 'wc-pos-settings' == $_GET['page'] && 'license' == $_GET['tab'] ) return; ?>
		<div id="message" class="error">
			<p><?php printf( __( 'The WooCommerce POS Pro License Key has not been activated, so the plugin is inactive! %sClick here%s to activate the license key and the plugin.', 'woocommerce-pos-pro' ), '<a href="' . esc_url( admin_url( 'admin.php?page=wc-pos-settings&tab=license' ) ) . '">', '</a>' ); ?></p>
		</div>
		<?php
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
