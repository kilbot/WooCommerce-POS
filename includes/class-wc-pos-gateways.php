<?php

/**
* Loads the POS Payment Gateways
*
* @class    WC_POS_Gateways
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Gateways {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'woocommerce_payment_gateways', array( $this, 'payment_gateways' ) );
		add_action( 'woocommerce_pos_payment_gateways', array( $this, 'pos_gateways' ) );
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 10, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( $this, 'pos_status' ), 10, 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
	}

	/**
	 * Add POS gateways
	 * hide gateways on the woocommerce settings page
	 * @param $gateways
	 * @return array
	 */
	public function payment_gateways( $gateways ) {
		$screen = get_current_screen();
		if( !empty($screen) && $screen->id == 'woocommerce_page_wc-settings' ) {
			return $gateways;
		} else {
			array_push( $gateways, 'WC_POS_Gateways_Cash', 'WC_POS_Gateways_Card');
			return $gateways;
		}
	}

	/**
	 * Enable POS gateways
	 * @param $gateway
	 */
	public function pos_gateways( $gateway ) {
		if( in_array( $gateway->id, array( 'pos_cash', 'pos_card', 'paypal' ) ) )
			$gateway->pos = true;
	}

	/**
	 * Add POS Status column
	 *
	 * @param  array $columns
	 * @return array $new_columns
	 */
	public function woocommerce_payment_gateways_setting_columns( $columns ) {
		$new_columns = array();
		foreach ( $columns as $key => $column ) {
			$new_columns[$key] = $column;
			if( $key == 'status' ) {
				$new_columns['status'] = __( 'Online Store', 'woocommerce-pos' );
				$new_columns['pos_status'] = __( 'POS', 'woocommerce-pos' );
			}
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 *
	 * @param  object $gateway
	 */
	public function pos_status( $gateway ) {

		$enabled_gateways = (array) get_option( 'woocommerce_pos_enabled_gateways' );

		echo '<td class="pos_status">';
		if ( in_array( $gateway->id, $enabled_gateways ) )
			/* translators: woocommerce-admin */
			echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce-admin' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
		else
			echo '-';
		echo '</td>';
	}

	/**
	 * CSS
	 */
	public function enqueue_admin_styles() {
		$screen = get_current_screen();

		if ( $screen->id == 'woocommerce_page_wc-settings' ) {
			$css = '
				table.wc_gateways .pos_status, table.wc_gateways .pos_enabled { text-align: center; }
				table.wc_gateways .pos_status .tips, table.wc_gateways .pos_enabled .tips { margin: 0 auto; }
				.status-disabled:before { font-family:WooCommerce; speak:none; font-weight:400; font-variant:normal; text-transform:none; line-height:1; -webkit-font-smoothing:antialiased; margin:0; text-indent:0; position:absolute; top:0;left:0; width:100%; height:100%; text-align:center; content: "\e602"; color:#E0E0E0; }
			';
			wp_add_inline_style( 'wp-admin', $css );
		}

	}

}