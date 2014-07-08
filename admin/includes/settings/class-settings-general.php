<?php

/**
 * POS Admin General Settings Class
 * 
 * @class 	  WC_POS_Settings_General
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
if ( ! class_exists( 'WC_POS_Settings_General' ) ) :

class WC_POS_Settings_General extends WC_POS_Settings_Page {

	/**
	 * @var mixed
	 */
	public $grant_access;
	public $default_customer;
	
	public function __construct() {
		$this->id    = 'general';
		$this->label = __( 'General', 'woocommerce-pos' );

		// set option keys
		$this->grant_access 	= 'woocommerce_pos_grant_access';
		$this->default_customer = 'woocommerce_pos_default_customer';

		// add General tab
		add_filter( 'woocommerce_pos_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
		add_action( 'woocommerce_pos_settings_' . $this->id, array( $this, 'output' ) );
		add_action( 'woocommerce_pos_settings_save_' . $this->id, array( $this, 'save' ) );
	}

	/**
	 * Get settings array
	 *
	 * @return array
	 */
	public function get_settings() {

		$customer_id = get_option( $this->default_customer, 0 );

		$settings = array(
			array( 'title' => __( 'General Options', 'woocommerce-pos' ), 'type' => 'title', 'desc' => '', 'id' => 'general_options' ),
			array(
				'title' 	=> __( 'Grant POS Access', 'woocommerce-pos' ),
				'desc' 		=> __( 'Select which user roles have access to the POS.', 'woocommerce-pos' ),
				'id' 		=> $this->grant_access,
				'desc_tip'	=> true,
				'type' 		=> 'multiselect',
				'css' 		=> 'width:400px;',
				'default'   => array_keys( $this->get_roles('manage_woocommerce_pos') ),
				'class'		=> 'chosen_select',
				'options' 	=> $this->get_roles(),
				'custom_attributes' => array(
					'data-placeholder' => __( 'Select user roles', 'woocommerce-pos' )
				)
			),
			array(
				'title' 	=> __( 'Default POS Customer', 'woocommerce-pos' ),
				'desc' 		=> __( 'The default customer for POS orders, eg: Guest or create a new customer.', 'woocommerce-pos' ),
				'id' 		=> $this->default_customer,
				'default'	=> $customer_id,
				'type' 		=> 'select',
				'css' 		=> 'min-width:350px;',
				'class' 	=> 'ajax_chosen_select_customer',
				'desc_tip'	=> true,
				'options' 	=> $this->get_customer( $customer_id )
			),
			array( 'type' => 'sectionend', 'id' => 'general_options'),
		);
		
		return $settings;
	}

	/**
	 * Get the default customer, plus Guest as default option
	 * @return [type] [description]
	 */
	public function get_customer( $customer_id ) {
		
		$options[0] = __( 'Guest', 'woocommerce-pos' ); 

		if ( isset( $customer_id ) && $customer_id != 0 ) {
			$user = get_user_by( 'id', $customer_id );
			$options[ $customer_id ] = esc_html( $user->display_name ) . ' (#' . absint( $user->ID ) . ' &ndash; ' . esc_html( $user->user_email );
		}

		return $options;
	}

	public function get_roles( $cap = false ) {
		global $wp_roles;
		
		if( $wp_roles->roles ) {
			foreach( $wp_roles->roles as $slug => $role ) {
				if( $cap ) {
					if( isset( $role['capabilities'][$cap] ) &&  $role['capabilities'][$cap] == 1 ) 
						$options[$slug] = $role['name'];
				} else {
					$options[$slug] = $role['name'];
				}
			}
		}
		return $options;
	}

	public function output() {

		$settings = $this->get_settings();
		WC_POS_Admin_Settings::output_fields( $settings );

		// Ajax Chosen Customer Selectors JS
		wc_enqueue_js( "
			jQuery( 'select.ajax_chosen_select_customer' ).ajaxChosen({
				method:         'GET',
				url:            '" . admin_url( 'admin-ajax.php' ) . "',
				dataType:       'json',
				afterTypeDelay: 100,
				minTermLength:  1,
				data:           {
					action:   'woocommerce_json_search_customers',
					security: '" . wp_create_nonce( 'search-customers' ) . "'
				}
			}, function ( data ) {

				var terms = {};

				$.each( data, function ( i, val ) {
					terms[i] = val;
				});

				return terms;
			});
		" );
	}

	/**
	 * Save settings
	 */
	public function save() {

		// process grant access
		if( isset($_POST['woocommerce_pos_grant_access']) ) {
			$this->grant_access( $_POST['woocommerce_pos_grant_access'] );
			unset( $_POST['woocommerce_pos_grant_access'] ); 
		}

		// process the rest
		$settings = $this->get_settings();
		WC_POS_Admin_Settings::save_fields( $settings );
	}

	/**
	 * Grant/Revoke access to WooCommerce POS
	 * @param array $roles
	 */
	public function grant_access( $roles = '' ) {

		$current_roles = array_keys( $this->get_roles('manage_woocommerce_pos') );

		if( !is_array( $roles ) || $current_roles === $roles )
			return;

		// grant access
		foreach ($roles as $slug) {
			$role = get_role( $slug );
			if( $role ) {
				$role->add_cap( 'manage_woocommerce_pos' ); // pos access
				$role->add_cap( 'read_private_products' ); // api access
			}
		}

		// revoke access
		$revoke = array_diff($current_roles, $roles);
		if( !empty($revoke) ) {
			foreach ($revoke as $slug) {
				$role = get_role( $slug );
				if( $role ) {
					$role->remove_cap( 'manage_woocommerce_pos' ); // pos access 
					$role->add_cap( 'read_private_products' ); // api access
				}
			}	
		}
	}

}

endif;
return new WC_POS_Settings_General();