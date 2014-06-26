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
	public $default_customer;

	public function __construct() {
		$this->id    = 'general';
		$this->label = __( 'General', 'woocommerce-pos' );

		// set option keys
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
				'title' 	=> __( 'Default POS Customer', 'woocommerce-pos' ),
				'desc' 		=> __( 'The default customer for POS orders, eg: Guest or create a new customer', 'woocommerce-pos' ),
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
		$settings = $this->get_settings();
		WC_POS_Admin_Settings::save_fields( $settings );
	}

}

endif;
return new WC_POS_Settings_General();