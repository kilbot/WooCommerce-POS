<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Todd Lahman LLC Updater - Single Updater Class
 *
 * @package Update API Manager/Update Handler
 * @author Todd Lahman LLC
 * @copyright   Copyright (c) Todd Lahman LLC
 * @since 1.0.0
 *
 */

class WC_POS_Pro_Update_Check {

	/**
	 * @var The single instance of the class
	 */
	protected static $_instance = null;

	/**
	 *
	 * Ensures only one instance of SimpleComments is loaded or can be loaded.
	 *
	 * @static
	 * @return class instance
	 */
	public static function instance( $upgrade_url, $plugin_name, $product_id, $api_key, $activation_email, $renew_license_url, $instance, $domain, $software_version, $plugin_or_theme, $text_domain, $extra = '' ) {

		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self( $upgrade_url, $plugin_name, $product_id, $api_key, $activation_email, $renew_license_url, $instance, $domain, $software_version, $plugin_or_theme, $text_domain, $extra );
		}

		return self::$_instance;
	}

	private $upgrade_url; // URL to access the Update API Manager.
	private $plugin_name; // same as plugin slug. if a theme use a theme name like 'twentyeleven'
	private $product_id; // Software Title
	private $api_key; // API License Key
	private $activation_email; // License Email
	private $renew_license_url; // URL to renew a license
	private $instance; // Instance ID (unique to each blog activation)
	private $domain; // blog domain name
	private $software_version;
	private $plugin_or_theme; // 'theme' or 'plugin'
	private $text_domain; // localization for translation
	private $extra; // Used to send any extra information.

	/**
	 * Constructor.
	 *
	 * @access public
	 * @since  1.0.0
	 * @return void
	 */
	public function __construct( $upgrade_url, $plugin_name, $product_id, $api_key, $activation_email, $renew_license_url, $instance, $domain, $software_version, $plugin_or_theme, $text_domain, $extra ) {
		// API data
		$this->upgrade_url 			= $upgrade_url;
		$this->plugin_name 			= $plugin_name; // same as plugin slug. if a theme use a theme name like 'twentyeleven'
		$this->product_id 			= $product_id;
		$this->api_key 				= $api_key;
		$this->activation_email 	= $activation_email;
		$this->renew_license_url 	= $renew_license_url;
		$this->instance 			= $instance;
		$this->domain 				= $domain;
		$this->software_version 	= $software_version;
		$this->text_domain 			= $text_domain;
		$this->extra 				= $extra;

		/**
		 * Flag for plugin or theme updates
		 * @access public
		 * @since  1.0.0
		 * @param string, plugin or theme
		 */
		$this->plugin_or_theme		= $plugin_or_theme; // 'theme' or 'plugin'

		/*********************************************************************
		 * The plugin and theme filters should not be active at the same time
		 *********************************************************************/

		/**
		 * More info:
		 * function set_site_transient moved from wp-includes/functions.php
		 * to wp-includes/option.php in WordPress 3.4
		 *
		 * set_site_transient() contains the pre_set_site_transient_{$transient} filter
		 * {$transient} is either update_plugins or update_themes
		 *
		 * Transient data for plugins and themes exist in the Options table:
		 * _site_transient_update_themes
		 * _site_transient_update_plugins
		 */

		// uses the flag above to determine if this is a plugin or a theme update request
		if ( $this->plugin_or_theme == 'plugin' ) {
			/**
			 * Plugin Updates
			 */
			// Check For Plugin Updates
			add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'update_check' ) );

			// Check For Plugin Information to display on the update details page
			add_filter( 'plugins_api', array( $this, 'request' ), 10, 3 );

		} else if ( $this->plugin_or_theme == 'theme' ) {
			/**
			 * Theme Updates
			 */
			// Check For Theme Updates
			add_filter( 'pre_set_site_transient_update_themes', array( $this, 'update_check' ) );

			// Check For Theme Information to display on the update details page
			//add_filter( 'themes_api', array( $this, 'request' ), 10, 3 );

		}

	}

	// Upgrade API URL
	private function create_upgrade_api_url( $args ) {
		$upgrade_url = add_query_arg( 'wc-api', 'upgrade-api', $this->upgrade_url );

		return $upgrade_url . '&' . http_build_query( $args );
	}

	/**
	 * Check for updates against the remote server.
	 *
	 * @access public
	 * @since  1.0.0
	 * @param  object $transient
	 * @return object $transient
	 */
	public function update_check( $transient ) {

		// pre_set_site_transient_update_plugins is called twice
		// we only want to act on the second run
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		$args = array(
					'request'			=>	'pluginupdatecheck',
					'plugin_name'		=>	$this->plugin_name,
					//'version'			=>	$transient->checked[$this->plugin_name],
					'version'			=>	$this->software_version,
					'product_id'		=>	$this->product_id,
					'api_key'			=>	$this->api_key,
					'activation_email'	=>	$this->activation_email,
					'instance'			=>	$this->instance,
					'domain'			=>	$this->domain,
					'software_version'	=>	$this->software_version,
					'extra'				=> 	$this->extra,
					);

		// Check for a plugin update
		$response = $this->plugin_information( $args );

		// Displays an admin error message in the WordPress dashboard
		$this->check_response_for_errors( $response );

		// if error, deactivate
		if( ! empty( $response->errors ) ) {
			update_option( 'woocommerce_pos_pro_activated', 'Deactivated' );	
		}

		// Set version variables
		if ( isset( $response ) && is_object( $response ) && $response !== false ) {
			// New plugin version from the API
			$new_ver = (string)$response->new_version;
			// Current installed plugin version
			$curr_ver = (string)$this->software_version;
			//$curr_ver = (string)$transient->checked[$this->plugin_name];
		}

		// If there is a new version, modify the transient to reflect an update is available
		if ( isset( $new_ver ) && isset( $curr_ver ) ) {

			if ( $response !== false && version_compare( $new_ver, $curr_ver, '>' ) ) {

				if ( $this->plugin_or_theme == 'plugin' ) {

					$transient->response['woocommerce-pos-pro/woocommerce-pos-pro.php'] = $response;

				} else if ( $this->plugin_or_theme == 'theme' ) {

					$transient->response[$this->plugin_name]['new_version'] = $response->new_version;
					$transient->response[$this->plugin_name]['url'] = $response->url;
					$transient->response[$this->plugin_name]['package'] = $response->package;

				}

			}

		}

		return $transient;
	}

	/**
	 * Sends and receives data to and from the server API
	 *
	 * @access public
	 * @since  1.0.0
	 * @return object $response
	 */
	public function plugin_information( $args ) {

		$target_url = $this->create_upgrade_api_url( $args );

		$request = wp_remote_get( $target_url, array( 'timeout' => 45 ) );

		if ( is_wp_error( $request ) || wp_remote_retrieve_response_code( $request ) != 200 ) {
			return false;
		}

		$response = unserialize( wp_remote_retrieve_body( $request ) );

		/**
		 * For debugging errors from the API
		 * For errors like: unserialize(): Error at offset 0 of 170 bytes
		 * Comment out $response above first
		 */
		// $response = wp_remote_retrieve_body( $request );
		// print_r($response); exit;


		if ( is_object( $response ) ) {
			return $response;
		} else {
			return false;
		}
	}

	/**
	 * Generic request helper.
	 *
	 * @access public
	 * @since  1.0.0
	 * @param  array $args
	 * @return object $response or boolean false
	 */
	public function request( $false, $action, $args ) {

		// Is this a plugin or a theme?
		if ( $this->plugin_or_theme == 'plugin' ) {

			$version = get_site_transient( 'update_plugins' );

		} else if ( $this->plugin_or_theme == 'theme' ) {

			$version = get_site_transient( 'update_themes' );

		}

		// Check if this plugins API is about this plugin
		if ( isset( $args->slug ) ) {

			// Check if this plugins API is about this plugin
			if ( $args->slug != $this->plugin_name ) {
				return $false;
			}

		} else {

			return $false;

		}

		$args = array(
					'request'			=> 'plugininformation',
					'plugin_name'		=>	$this->plugin_name,
					//'version'			=>	$version->checked[$this->plugin_name],
					'version'			=>	$this->software_version,
					'product_id'		=>	$this->product_id,
					'api_key'			=>	$this->api_key,
					'activation_email'	=>	$this->activation_email,
					'instance'			=>	$this->instance,
					'domain'			=>	$this->domain,
					'software_version'	=>	$this->software_version,
					'extra'				=> 	$this->extra,
					);

		$response = $this->plugin_information( $args );

		// If everything is okay return the $response
		if ( isset( $response ) && is_object( $response ) && $response !== false ) {
			return $response;
		}

	}

	/**
	 * Displays an admin error message in the WordPress dashboard
	 * @param  array $response
	 * @return string
	 */
	public function check_response_for_errors( $response ) {

		if ( ! empty( $response ) ) {

			if ( isset( $response->errors['no_key'] ) && $response->errors['no_key'] == 'no_key' && isset( $response->errors['no_subscription'] ) && $response->errors['no_subscription'] == 'no_subscription' ) {

				add_action('admin_notices', array( $this, 'no_key_error_notice') );
				add_action('admin_notices', array( $this, 'no_subscription_error_notice') );

			} else if ( isset( $response->errors['exp_license'] ) && $response->errors['exp_license'] == 'exp_license' ) {

				add_action('admin_notices', array( $this, 'expired_license_error_notice') );

			}  else if ( isset( $response->errors['hold_subscription'] ) && $response->errors['hold_subscription'] == 'hold_subscription' ) {

				add_action('admin_notices', array( $this, 'on_hold_subscription_error_notice') );

			} else if ( isset( $response->errors['cancelled_subscription'] ) && $response->errors['cancelled_subscription'] == 'cancelled_subscription' ) {

				add_action('admin_notices', array( $this, 'cancelled_subscription_error_notice') );

			} else if ( isset( $response->errors['exp_subscription'] ) && $response->errors['exp_subscription'] == 'exp_subscription' ) {

				add_action('admin_notices', array( $this, 'expired_subscription_error_notice') );

			} else if ( isset( $response->errors['suspended_subscription'] ) && $response->errors['suspended_subscription'] == 'suspended_subscription' ) {

				add_action('admin_notices', array( $this, 'suspended_subscription_error_notice') );

			} else if ( isset( $response->errors['pending_subscription'] ) && $response->errors['pending_subscription'] == 'pending_subscription' ) {

				add_action('admin_notices', array( $this, 'pending_subscription_error_notice') );

			} else if ( isset( $response->errors['trash_subscription'] ) && $response->errors['trash_subscription'] == 'trash_subscription' ) {

				add_action('admin_notices', array( $this, 'trash_subscription_error_notice') );

			} else if ( isset( $response->errors['no_subscription'] ) && $response->errors['no_subscription'] == 'no_subscription' ) {

				add_action('admin_notices', array( $this, 'no_subscription_error_notice') );

			} else if ( isset( $response->errors['no_activation'] ) && $response->errors['no_activation'] == 'no_activation' ) {

				add_action('admin_notices', array( $this, 'no_activation_error_notice') );

			} else if ( isset( $response->errors['no_key'] ) && $response->errors['no_key'] == 'no_key' ) {

				add_action('admin_notices', array( $this, 'no_key_error_notice') );

			} else if ( isset( $response->errors['download_revoked'] ) && $response->errors['download_revoked'] == 'download_revoked' ) {

				add_action('admin_notices', array( $this, 'download_revoked_error_notice') );

			} else if ( isset( $response->errors['switched_subscription'] ) && $response->errors['switched_subscription'] == 'switched_subscription' ) {

				add_action('admin_notices', array( $this, 'switched_subscription_error_notice') );

			}

		}

	}

	/**
	 * Display license expired error notice
	 * @param  string $message
	 * @return void
	 */
	public function expired_license_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The license key for %s has expired. You can reactivate or purchase a license key from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription on-hold error notice
	 * @param  string $message
	 * @return void
	 */
	public function on_hold_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The subscription for %s is on-hold. You can reactivate the subscription from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription cancelled error notice
	 * @param  string $message
	 * @return void
	 */
	public function cancelled_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The subscription for %s has been cancelled. You can renew the subscription from your account <a href="%s" target="_blank">dashboard</a>. A new license key will be emailed to you after your order has been completed.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription expired error notice
	 * @param  string $message
	 * @return void
	 */
	public function expired_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The subscription for %s has expired. You can reactivate the subscription from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription expired error notice
	 * @param  string $message
	 * @return void
	 */
	public function suspended_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The subscription for %s has been suspended. You can reactivate the subscription from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription expired error notice
	 * @param  string $message
	 * @return void
	 */
	public function pending_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The subscription for %s is still pending. You can check on the status of the subscription from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription expired error notice
	 * @param  string $message
	 * @return void
	 */
	public function trash_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'The subscription for %s has been placed in the trash and will be deleted soon. You can purchase a new subscription from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display subscription expired error notice
	 * @param  string $message
	 * @return void
	 */
	public function no_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'A subscription for %s could not be found. You can purchase a subscription from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display missing key error notice
	 * @param  string $message
	 * @return void
	 */
	public function no_key_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'A license key for %s could not be found. Maybe you forgot to enter a license key when setting up %s, or the key was deactivated in your account. You can reactivate or purchase a license key from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display missing download permission revoked error notice
	 * @param  string $message
	 * @return void
	 */
	public function download_revoked_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'Download permission for %s has been revoked possibly due to a license key or subscription expiring. You can reactivate or purchase a license key from your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}

	/**
	 * Display no activation error notice
	 * @param  string $message
	 * @return void
	 */
	public function no_activation_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( '%s has not been activated. Go to the settings page and enter the license key and license email to activate %s.', $this->text_domain ) . '</p></div>', $plugin_name, $plugin_name ) ;

	}

	/**
	 * Display switched activation error notice
	 * @param  string $message
	 * @return void
	 */
	public function switched_subscription_error_notice( $message ){

		$plugins = get_plugins();

		$plugin_name = isset( $plugins[$this->plugin_name] ) ? $plugins[$this->plugin_name]['Name'] : $this->plugin_name;

		echo sprintf( '<div id="message" class="error"><p>' . __( 'You changed the subscription for %s, so you will need to enter your new API License Key in the settings page. The License Key should have arrived in your email inbox, if not you can get it by logging into your account <a href="%s" target="_blank">dashboard</a>.', $this->text_domain ) . '</p></div>', $plugin_name, $this->renew_license_url ) ;

	}


} // End of class
