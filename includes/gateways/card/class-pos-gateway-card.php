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
		add_action( 'woocommerce_thankyou_pos_card', array( $this, 'calculate_cashback' ) );

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

		$currency_pos = get_option( 'woocommerce_currency_pos' );

		if( $currency_pos == 'left' || 'left_space') {
			$left_addon = '<span class="input-group-addon">'. get_woocommerce_currency_symbol( get_woocommerce_currency() ) .'</span>';
			$right_addon = '';
		} else {
			$left_addon = '';
			$right_addon = '<span class="input-group-addon">'. get_woocommerce_currency_symbol( get_woocommerce_currency() ) .'</span>';
		}

		echo '
			<div class="form-row " id="pos-cashback_field">
				<label for="pos-cashback" class="">'. __('Cashback', 'woocommerce-pos') .'</label>
				<div class="input-group">
				'. $left_addon .'
					<input type="text" class="input-text " name="pos-cashback" id="pos-cashback" placeholder="" maxlength="20" value="" data-numpad="cash" data-title="'. __('Cashback', 'woocommerce-pos') .'" data-placement="bottom" data-original="0">
				'. $right_addon .'
				</div>
			</div>
		';

	}

	public function process_payment( $order_id ) {

		// get order object
		$order = new WC_Order( $order_id );

		$cashback = isset( $_REQUEST['pos-cashback'] ) ? $_REQUEST['pos-cashback'] : 0 ;
		$cashback = abs((int) filter_var( $cashback, FILTER_SANITIZE_NUMBER_INT ));
		
		if( $cashback !== 0 ) {

			// add order meta
			update_post_meta( $order_id, '_pos_card_cashback', $cashback );

			// add cashback as fee line item
			// TODO: this should be handled by $order->add_fee after WC 2.2
			$item_id = wc_add_order_item( $order_id, array(
				'order_item_name' => __('Cashback', 'woocommerce-pos'),
				'order_item_type' => 'fee'
			) );

			if ( $item_id ) {
				wc_add_order_item_meta( $item_id, '_line_total', $cashback );
				wc_add_order_item_meta( $item_id, '_line_tax', 0 );
				wc_add_order_item_meta( $item_id, '_line_subtotal', $cashback );
				wc_add_order_item_meta( $item_id, '_line_subtotal_tax', 0 );
				wc_add_order_item_meta( $item_id, '_tax_class', 'zero-rate' );
			}

			// update the order total to include fee
			$order_total = get_post_meta( $order_id, '_order_total', true );
			$order_total += $cashback;
			update_post_meta( $order_id, '_order_total', $order_total );

		}

		// payment complete
		$order->payment_complete();

		// Return thankyou redirect
		return array(
			'result' => 'success'
		);
	}

	public function calculate_cashback( $order_id ) {
		$message = '';
		$cashback = get_post_meta( $order_id, '_pos_card_cashback', true );

		// construct message
		if( $cashback ) {
			$message = '<strong>'. __('Cashback', 'woocommerce-pos') .':</strong> ';
			$message .= wc_price($cashback);
		}

		echo $message;
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