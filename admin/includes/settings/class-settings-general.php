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

	public function __construct() {
		$this->id    = 'general';
		$this->label = __( 'General', 'woocommerce-pos' );

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
		$settings = array(
			array( 'title' => __( 'General Options', 'woocommerce-pos' ), 'type' => 'title', 'desc' => '', 'id' => 'general_options' ),
			array(
				'title' 	=> __( 'Default POS Customer', 'woocommerce-pos' ),
				'desc' 		=> __( 'The default customer for POS orders, eg: <em>Guest</em> or create a new user called <em>Walk-in Customer</em>', 'woocommerce-pos' ),
				'id' 		=> 'woocommerce_pos_default_customer',
				'default'	=> __( 'Guest', 'woocommerce-pos' ),
				'type' 		=> 'text',
				'css' 		=> 'min-width:300px;',
				'desc_tip'	=> false,
			),
			array( 'type' => 'sectionend', 'id' => 'general_options'),
		);
		
		return $settings;
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