<?php
/**
 *
 *
 * @class    WC_POS_Params
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Params {

	/**
	 * Required parameters for the POS front end
	 */
	public function frontend() {

		$param['accounting'] 	= $this->accounting_settings();
		$param['ajaxurl'] 	    = admin_url( 'admin-ajax.php', 'relative' );
		$param['customer'] 	    = $this->get_default_customer();
		$param['denominations'] = WC_POS_i18n::currency_denominations( get_option('woocommerce_currency') );
		$param['hotkeys'] 	    = $this->hotkeys();
		$param['nonce'] 		= wp_create_nonce( WC_POS_PLUGIN_NAME );
		$param['tabs'] 		    = $this->product_tabs();
		$param['tax'] 		    = $this->wc_settings();
		$param['tax_labels']    = $this->tax_labels();
		$param['tax_rates']     = $this->tax_rates();
		$param['user'] 		    = $this->user();
		$param['wc_api']        = get_woocommerce_api_url( '' );
		$param['worker'] 	    = WC_POS_PLUGIN_URL .'public/assets/js/worker.min.js?ver='. WC_POS_VERSION;

		return apply_filters( 'woocommerce_pos_params', $param );

	}

	/**
	 * @return mixed|void
	 */
	public function admin() {

		$param['nonce'] = wp_create_nonce( WC_POS_PLUGIN_NAME );
		$param['page']  = 'settings';

		$param['hotkeys'] = $this->hotkeys();

		return apply_filters( 'woocommerce_pos_admin_params', $param );
	}

	/**
	 * Default quick tabs for products
	 *
	 * @return array
	 */
	public function product_tabs() {
		$tabs = array(
			array(
				/* translators: woocommerce-admin */
				'label' => __( 'All', 'woocommerce'),
				'active' => true
			),
			array(
				/* translators: woocommerce-admin */
				'label' => __( 'Featured', 'woocommerce'),
				'value' => 'featured:true'
			),
			array(
				'label' => _x( 'On Sale', 'Product tab: \'On Sale\' products', 'woocommerce-pos'),
				'value' => 'on_sale:true'
			),
		);
		return $tabs;
	}

	/**
	 * Default hotkeys
	 *
	 * @return array
	 */
	public function hotkeys() {

		// default keys
		$keys = array(
			array(
				'id' => 'help',
				'label' => __( 'Help screen' ),
				'key' => 'shift+/'
			),
			array(
				'id' => 'barcode',
				'label' => __( 'Barcode mode' ),
				'key' => 'ctrl+b'
			),
			array(
				'id' => 'sync',
				'label' => __( 'Sync with server' ),
				'key' => 'ctrl+s'
			)
		);
		$keys = apply_filters( 'woocommerce_pos_hotkeys', $keys );

		// merge with user options
		$user_options = get_user_option( WC_POS_Admin_Settings::DB_PREFIX . 'hotkeys' );
		if( is_array( $user_options ) ) {
			$keys = array_merge( $keys, $user_options );
		}

		return $keys;
	}

	/**
	 * Get the accounting format from user settings
	 * POS uses a plugin to format currency: http://josscrowcroft.github.io/accounting.js/
	 *
	 * @return array $settings
	 */
	public function accounting_settings() {
		$decimal = get_option( 'woocommerce_price_decimal_sep' );
		$thousand = get_option( 'woocommerce_price_thousand_sep' );
		$precision = get_option( 'woocommerce_price_num_decimals' );
		$settings = array(
			'currency' => array(
				'decimal'	=> $decimal,
				'format'	=> $this->currency_format(),
				'precision'	=> $precision,
				'symbol'	=> get_woocommerce_currency_symbol( get_woocommerce_currency() ),
				'thousand'	=> $thousand,
			),
			'number' => array(
				'decimal'	=> $decimal,
				'precision'	=> $precision,
				'thousand'	=> $thousand,
			)
		);
		return $settings;
	}

	/**
	 * Get the currency format from user settings
	 *
	 * @return array $format
	 */
	private function currency_format() {
		$currency_pos = get_option( 'woocommerce_currency_pos' );

		if( $currency_pos == 'right' )
			return array('pos' => '%v%s', 'neg' => '- %v%s', 'zero' => '%v%s');

		if( $currency_pos == 'left_space' )
			return array('pos' => '%s&nbsp;%v', 'neg' => '- %s&nbsp;%v', 'zero' => '%s&nbsp;%v');

		if( $currency_pos == 'right_space' )
			return array('pos' => '%v&nbsp;%s', 'neg' => '- %v&nbsp;%s', 'zero' => '%v&nbsp;%s');

		// default = left
		return array('pos' => '%s%v', 'neg' => '- %s%v', 'zero' => '%s%v');
	}

	/**
	 * Get the default customer
	 *
	 * @return object $customer
	 */
	public function get_default_customer() {
		$id 	= get_option( 'woocommerce_pos_default_customer', 0 );
		$user 	= get_userdata( $id );
		if( $user ) {
			$first_name = esc_html( $user->first_name );
			$last_name 	= esc_html( $user->last_name );
			$name		= $first_name .' '. $last_name;
			if ( trim($name) == '' ) $name = esc_html( $user->display_name );
		} else {
			/* translators: woocommerce */
			$name = __( 'Guest', 'woocommerce' );
		}
		$customer = array(
			'default_id' => $id,
			'default_name' => $name
		);
		return $customer;
	}

	/**
	 * Get the woocommerce shop settings
	 *
	 * @return array $settings
	 */
	public function wc_settings() {
		$settings = array(
			'tax_label'				=> WC()->countries->tax_or_vat(),
			'calc_taxes'			=> get_option( 'woocommerce_calc_taxes' ),
			'prices_include_tax'	=> get_option( 'woocommerce_prices_include_tax' ),
			'tax_round_at_subtotal'	=> get_option( 'woocommerce_tax_round_at_subtotal' ),
			'tax_display_cart'		=> get_option( 'woocommerce_tax_display_cart' ),
			'tax_total_display'		=> get_option( 'woocommerce_tax_total_display' ),
		);
		return $settings;
	}

	/**
	 * User settings
	 *
	 * @return array $settings
	 */
	public function user() {
		global $current_user;

		$settings = array(
			'id' 			=> $current_user->ID,
			'display_name' 	=> $current_user->display_name
		);

		return $settings;
	}

	public function tax_rates() {
		$rates = array();

		$classes = array_filter( array_map( 'sanitize_title', explode( "\n", get_option('woocommerce_tax_classes' ) ) ) );
		array_unshift( $classes, '' ); // add 'standard'

		// get_shop_base_rate depreciated in 2.3
		$get_rates = method_exists( 'WC_Tax','get_base_tax_rates' ) ? 'get_base_tax_rates' : 'get_shop_base_rate';

		foreach( $classes as $class ) {
			if( $rate = WC_Tax::$get_rates( $class ) )
				$rates[$class] = $rate;
		}

		return $rates;
	}

	public function tax_labels() {
		$labels = array_reduce( explode( "\n", get_option('woocommerce_tax_classes' ) ), function ($result, $label) {
			if( $label = trim($label) ) {
				$result[ sanitize_title($label) ] = $label;
			}
			return $result;
		}, array());

		/* translators: woocommerce */
		$standard[''] = __( 'Standard', 'woocommerce' );

		return $standard + $labels;
	}

}