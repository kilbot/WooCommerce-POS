<?php

/**
 * POS Pro License Settings Class
 * 
 * @class 	  WC_POS_Pro_Settings_License
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
if ( ! class_exists( 'WC_POS_Pro_Settings_License' ) ) :

class WC_POS_Pro_Settings_License extends WC_POS_Settings_Page {

	public function __construct() {

		// Get the variables set in class-pos-admin.php
		// TODO: is this the best way?
		$this->api = WooCommerce_POS_Pro_Admin::get_instance();

		$this->id    = 'license';
		$this->label = __( 'Pro License', 'woocommerce-pos' );

		// add License tab
		add_filter( 'woocommerce_pos_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
		add_action( 'woocommerce_pos_settings_' . $this->id, array( $this, 'output' ) );
		add_action( 'woocommerce_pos_settings_save_' . $this->id, array( $this, 'save' ) );

	}

	// public function add_settings_tab() {
	// 	$tabs[$this->id] = $this->label ;
	// 	return $tabs;
	// }

	/**
	 * Get settings array
	 *
	 * @return array
	 */
	public function get_settings() {

		$options = $this->api->options;
		$key = isset( $_POST['woocommerce_pos_pro_key'] ) ? $_POST['woocommerce_pos_pro_key'] : $options[ $this->api->key ];
		$email = isset( $_POST['woocommerce_pos_pro_activation_email'] ) ? $_POST['woocommerce_pos_pro_activation_email'] : $options[ $this->api->activation_email ];

		$settings = array(
			array( 'title' => __( 'WooCommerce POS Pro License Activation', 'woocommerce-pos' ), 'type' => 'title', 'desc' => '', 'id' => 'license_activation' ),
			array(
				'title' => __( 'License Key', 'woocommerce-pos' ),
				'desc' 		=> '',
				'id' 		=> 'woocommerce_pos_pro_key',
				'default'	=> $key,
				'type' 		=> 'text',
				'css' 		=> 'min-width:400px;',
				'desc_tip'	=>  false,
			),
			array(
				'title' => __( 'License Email', 'woocommerce-pos' ),
				'desc' 		=> '',
				'id' 		=> 'woocommerce_pos_pro_activation_email',
				'default'	=> $email,
				'type' 		=> 'email',
				'css' 		=> 'min-width:400px;',
				'desc_tip'	=>  false,
			),
			array( 'type' => 'sectionend', 'id' => 'license_activation'),
		);
		
		return $settings;
	}

	/**
	 * Save settings
	 */
	public function save() {

		$options = $this->api->options; 

		$input[ $this->api->key ] = trim( $_REQUEST[ 'woocommerce_pos_pro_key' ] );
		$input[ $this->api->activation_email ] = trim( $_REQUEST[ 'woocommerce_pos_pro_activation_email' ] );
		
		// Plugin activation
		$activation_status = get_option( $this->api->activated_key );
		$current_api_key = $options[ $this->api->key ];

		if( $activation_status == 'Deactivated' || $activation_status == '' || $input[ $this->api->key ] == '' || $input[ $this->api->activation_email ] == '' || $current_api_key != $input[ $this->api->key ] ) {

			/**
			 * If this is a new key, and an existing key already exists in the database,
			 * deactivate the existing key before activating the new key.
			 */
			if ( $current_api_key != $input[ $this->api->key ] )
				$this->replace_license_key( $current_api_key, $options[ $this->api->activation_email ] );

			$args = array(
				'email' => $input[ $this->api->activation_email ],
				'licence_key' => $input[ $this->api->key ],
			);

			$activate_results = json_decode( $this->activate( $args ), true );

			if ( $activate_results['activated'] == true ) {
				// add_settings_error( 'activate_text', 'activate_msg', __( 'Plugin activated. ', AME()->text_domain ) . "{$activate_results['message']}.", 'updated' );
				$_GET['wc_message'] = __( 'Plugin activated. ', 'woocommerce-pos-pro' );
				update_option( $this->api->activated_key, 'Activated' );
			}

			if ( $activate_results == false ) {
				// add_settings_error( 'api_key_check_text', 'api_key_check_error', __( 'Connection failed to the License Key API server. Try again later.', AME()->text_domain ), 'error' );
				$input[ $this->api->key ] = '';
				$input[ $this->api->activation_email ] = '';
				update_option( $this->api->options[ $this->api->activated_key ], 'Deactivated' );
			}

			if ( isset( $activate_results['code'] ) ) {

				$error_msg = 'Error';
				if( isset( $activate_results['error'] ) ) $error_msg = $activate_results['error'];
				if( isset( $activate_results['additional info'] ) ) $error_msg .= ': '.$activate_results['additional info'];

				switch ( $activate_results['code'] ) {
					case '100':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'api_email_text', 'api_email_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
					case '101':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'api_key_text', 'api_key_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
					case '102':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'api_key_purchase_incomplete_text', 'api_key_purchase_incomplete_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
					case '103':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'api_key_exceeded_text', 'api_key_exceeded_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
					case '104':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'api_key_not_activated_text', 'api_key_not_activated_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
					case '105':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'api_key_invalid_text', 'api_key_invalid_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
					case '106':
						$_GET['wc_error'] = $error_msg;
						// add_settings_error( 'sub_not_active_text', 'sub_not_active_error', "{$activate_results['error']}. {$activate_results['additional info']}", 'error' );
					break;
				}

				// 
				$input[ $this->api->key ] = '';
				$input[ $this->api->activation_email ] = '';
				update_option( $this->api->activated_key, 'Deactivated' );

			}

			update_option( $this->api->data_key, $input );

		}

	}

	/**
	 * Deactivate the current license key before activating the new license key
	 * @param  [type] $current_key   [description]
	 * @param  [type] $current_email [description]
	 * @return [type]                [description]
	 */
	public function replace_license_key( $current_key, $current_email ) {

		$args = array(
			'email' => $current_email,
			'licence_key' => $current_key,
		);

		$reset = $this->deactivate( $args ); // reset license key activation

		if ( $reset == true )
			return true;

		return add_settings_error( 'not_deactivated_text', 'not_deactivated_error', __( 'The license could not be deactivated. Use the License Deactivation button to manually deactivate the license before activating a new license.', AME()->text_domain ), 'updated' );
	}


	/**
	 * Activate Key
	 * @param  [type] $args [description]
	 * @return [type]       [description]
	 */
	public function activate( $args ) {

		$defaults = array(
			'request' 			=> 'activation',
			'product_id' 		=> $this->api->software_id,
			'instance' 			=> $this->api->instance_id,
			'platform' 			=> $this->api->domain,
			'software_version' 	=> $this->api->software_version
		);

		$args = wp_parse_args( $defaults, $args );

		$target_url = self::create_software_api_url( $args );

		$request = wp_remote_get( $target_url );

		if( is_wp_error( $request ) || wp_remote_retrieve_response_code( $request ) != 200 ) {
		// Request failed
			return false;
		}

		$response = wp_remote_retrieve_body( $request );

		return $response;
	}

	public function deactivate( $args ) {

		$defaults = array(
			'request' 		=> 'deactivation',
			'product_id' 	=> $this->api->software_id,
			'instance' 		=> $this->api->instance_id,
			'platform' 		=> $this->api->domain
			);

		$args = wp_parse_args( $defaults, $args );

		$target_url = self::create_software_api_url( $args );

		$request = wp_remote_get( $target_url );

		if( is_wp_error( $request ) || wp_remote_retrieve_response_code( $request ) != 200 ) {
		// Request failed
			return false;
		}

		$response = wp_remote_retrieve_body( $request );

		return $response;
	}

	/**
	 * Checks if the software is activated or deactivated
	 * @param  array $args
	 * @return array
	 */
	public function status( $args ) {

		$defaults = array(
			'request' 		=> 'status',
			'product_id' 	=> $this->api->software_id,
			'instance' 		=> $this->api->instance_id,
			'platform' 		=> $this->api->domain
			);

		$args = wp_parse_args( $defaults, $args );

		$target_url = self::create_software_api_url( $args );

		$request = wp_remote_get( $target_url );

		if( is_wp_error( $request ) || wp_remote_retrieve_response_code( $request ) != 200 ) {
		// Request failed
			return false;
		}

		$response = wp_remote_retrieve_body( $request );

		return $response;
	}

	// API Key URL
	public function create_software_api_url( $args ) {

		$api_url = add_query_arg( 'wc-api', 'am-software-api', $this->api->upgrade_url );

		return $api_url . '&' . http_build_query( $args );
	}

}

endif;
return new WC_POS_Pro_Settings_License();