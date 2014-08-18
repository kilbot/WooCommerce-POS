<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Cash
 *
 * Provides a Card Payment Gateway.
 *
 * @class 		WooCommerce_POS_Gateway_Card
 * @extends		WC_Payment_Gateway
 */
class POS_Gateway_Card extends WC_Payment_Gateway {

	/** @var string 'no' never enabled in Online Store. */
	public $enabled = 'no';

    /**
     * Constructor for the gateway.
     */
	public function __construct() {
		$this->id                 = 'pos_card';
		$this->icon               = apply_filters( 'woocommerce_pos_card_icon', '' );
		$this->method_title       = __( 'Card', 'woocommerce-pos' );
		$this->method_description = __( 'Debit & Credit Card sales using an external EFTPOS machine.', 'woocommerce-pos' );
		$this->has_fields         = true;

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
				'default'     => __( 'Card', 'woocommerce-pos' ),
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
	 * Display the payment fields in the checkout
	 */
	public function payment_fields() {

		if ( $this->description ) {
			echo '<p>' . wp_kses_post( $this->description ) . '</p>';
		}

		echo '
			<p class="form-row " id="pos-cashback_field">
				<label for="pos-cashback" class="">'. __('Cashback', 'woocommerce-pos') .'</label>
				<input type="text" class="input-text " name="pos-cashback" id="pos-cashback" placeholder="" maxlength="20" value="" data-numpad="cash" data-title="'. __('Cashback', 'woocommerce-pos') .'" data-placement="bottom" data-original="0">
			</p>
		';

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