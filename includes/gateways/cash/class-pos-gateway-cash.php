<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Cash
 *
 * Provides a Cash Payment Gateway.
 *
 * @class 		WooCommerce_POS_Gateway_Cash
 * @extends		WC_Payment_Gateway
 */
class POS_Gateway_Cash extends WC_Payment_Gateway {

	/** @var string 'no' never enabled in Online Store. */
	public $enabled = 'no';

    /**
     * Constructor for the gateway.
     */
	public function __construct() {
		$this->id                 = 'pos_cash';
		$this->icon               = apply_filters( 'woocommerce_pos_cash_icon', '' );
		$this->method_title       = __( 'Cash', 'woocommerce-pos' );
		$this->method_description = __( 'Cash sales at the Point of Sale.', 'woocommerce-pos' );
		$this->has_fields         = false;

		// Load the settings.
		$this->init_form_fields();
		$this->init_settings();

        // Define user set variables
		$this->title        = $this->get_option( 'title' );
		$this->description  = $this->get_option( 'description' );

		// Actions
		add_action( 'woocommerce_pos_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );

	}

    /**
     * Initialise Gateway Settings Form Fields
     */
    public function init_form_fields() {

    	$this->form_fields = array(
			'title' => array(
				'title'       => __( 'Title', 'woocommerce-pos' ),
				'type'        => 'text',
				'description' => __( 'Payment method title.', 'woocommerce-pos' ),
				'default'     => __( 'Cash', 'woocommerce-pos' ),
				'desc_tip'    => true,
			),
			'description' => array(
				'title'       => __( 'Description', 'woocommerce-pos' ),
				'type'        => 'textarea',
				'description' => __( 'Payment method description that will be shown in the POS.', 'woocommerce-pos' ),
				'default'     => __( '', 'woocommerce-pos' ),
				'desc_tip'    => true,
			),
 	   );
    }

	/**
	 * Check If The Gateway Is Available For Use
	 *
	 * @return bool
	 */
	public function is_available() {
		return true;
	}

}