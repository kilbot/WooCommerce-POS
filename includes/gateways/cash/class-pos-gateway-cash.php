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
	 * Display the payment fields on the checkout modal
	 */
	public function payment_fields() {

		if ( $this->description ) {
			echo '<p>' . wp_kses_post( $this->description ) . '</p>';
		}

		$currency_pos = get_option( 'woocommerce_currency_pos' );

		if( $currency_pos == 'left' || 'left_space') {
			$left_addon = '<span class="input-group-addon">'. get_woocommerce_currency_symbol( get_woocommerce_currency() ) .'</span>';
			$right_addon = '';
		} else {
			$left_addon = '';
			$right_addon = '<span class="input-group-addon">'. get_woocommerce_currency_symbol( get_woocommerce_currency() ) .'</span>';
		}
		

		echo '
			<div class="form-row" id="pos-cash-tendered_field">
				<label for="pos-cash-tendered" class="">'. __('Amount Tendered', 'woocommerce-pos') .'</label>
				<div class="input-group">
				'. $left_addon .'
					<input type="text" class="input-text " name="pos-cash-tendered" id="pos-cash-tendered" placeholder="" maxlength="20" value="" data-numpad="cash" data-title="'. __('Amount Tendered', 'woocommerce-pos') .'" data-placement="bottom" data-original="{{total}}">
				'. $right_addon .'
				</div>
			</div>
		';

	}

	function process_payment( $order_id ) {

		$order = new WC_Order( $order_id );

		// payment complete
		$order->payment_complete();

		// Return thankyou redirect
		return array(
			'result' => 'success',
			'redirect' => $this->get_return_url( $order )
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