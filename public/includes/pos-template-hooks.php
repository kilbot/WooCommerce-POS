<?php

/**
 * WooCommerce POS Template Hooks
 * 
 * @class 	  WooCommerce_POS_Template_Hooks
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Template_Hooks {


	public function __construct() {

		add_action( 'woocommerce_pos_head', array( $this, 'pos_print_css' ) );
		add_action( 'woocommerce_pos_head', array( $this, 'print_head_js' ) );
		add_action( 'woocommerce_pos_before', array( $this, 'svg_defs' ) );
		add_action( 'woocommerce_pos_after', array( $this, 'print_footer_js' ) );
	}

	public function svg_defs() {
		include_once( WC_POS()->plugin_path . 'assets/svg-defs.svg' );
	}

	/**
	 * Get the woocommerce shop settings
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
	 * @return array $settings
	 */
	public function get_user_settings() {
		global $current_user;
		
		$settings = array(
			'id' 			=> $current_user->ID,
			'display_name' 	=> $current_user->display_name
		);

		return $settings;
	}

	/**
	 * Get the default customer
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
			$name = __( 'Guest', 'woocommerce-pos' );
		}
		$customer = array(
			'default_id' => $id,
			'default_name' => $name
		);
		return $customer;
	}

	/**
	 * Get the accounting format from user settings
	 * POS uses a plugin to format currency: http://josscrowcroft.github.io/accounting.js/
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
	 * @return array $format
	 */
	public function currency_format() {
		$currency_pos = get_option( 'woocommerce_currency_pos' );
		switch ( $currency_pos ) {
			case 'left' :
				$format = array('pos' => '%s%v', 'neg' => '- %s%v', 'zero' => '%s%v');
			break;
			case 'right' :
				$format = array('pos' => '%v%s', 'neg' => '- %v%s', 'zero' => '%v%s');
			break;
			case 'left_space' :
				$format = array('pos' => '%s&nbsp;%v', 'neg' => '- %s&nbsp;%v', 'zero' => '%s&nbsp;%v');
			break;
			case 'right_space' :
				$format = array('pos' => '%v&nbsp;%s', 'neg' => '- %v&nbsp;%s', 'zero' => '%v&nbsp;%s');
			break;
			default:
				$format = array('pos' => '%s%v', 'neg' => '- %s%v', 'zero' => '%s%v');
		}
		return $format;
	}

	/**
	 * Select2
	 * @return array settings
	 */
	public function select2_settings() {
		$settings = array(
			'no_matches'=> __( 'No matches found', 'woocommerce-pos' ),
			'too_short'	=> __( 'Please enter 1 more character', 'woocommerce-pos' ),
			'too_shorts'=> __( 'Please enter %d more characters', 'woocommerce-pos' ),
			'too_long' 	=> __( 'Please delete 1 character', 'woocommerce-pos' ),
			'too_longs' => __( 'Please delete %d characters', 'woocommerce-pos' ),
			'too_big' 	=> __( 'You can only select 1 item', 'woocommerce-pos' ),
			'too_bigs' 	=> __( 'You can only select %d items', 'woocommerce-pos' ),
			'load_more' => __( 'Loading more results', 'woocommerce-pos' ).'&hellip;',
			'searching' => __( 'Searching', 'woocommerce-pos' ).'&hellip;'
		);
		return $settings;
	}

	public function product_tabs() {
		$tabs = array(
			array(
				'label' => _x( 'All', 'Product tab: \'All\' products', 'woocommerce-pos'),
				'active' => true
			),
			array(
				'label' => _x( 'Featured', 'Product tab: \'Featured\' products', 'woocommerce-pos'),
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
	 * Add variables for use by js scripts
	 * @return [type] [description]
	 */
	public function pos_localize_script() {

		$js_vars['accounting'] 	= $this->accounting_settings();
		$js_vars['ajax_url'] 	= admin_url( 'admin-ajax.php', 'relative' );
		$js_vars['customer'] 	= $this->get_default_customer();
		$js_vars['denominations']= WC_POS()->currency->get_denomination( get_option('woocommerce_currency') );
		$js_vars['nonce'] 		= wp_create_nonce( "woocommerce-pos");
		$js_vars['page']		= WC_POS()->template;
		$js_vars['select'] 		= $this->select2_settings();
		$js_vars['tabs'] 		= $this->product_tabs();
		$js_vars['user'] 		= $this->get_user_settings();
		$js_vars['wc'] 			= $this->wc_settings();
		$js_vars['wc_api_url']	= WC_POS()->wc_api_url;

		// switch for development
		if( WC_POS()->development ) {
			$js_vars['worker'] 	= WC_POS()->plugin_url .'public/assets/js/src/worker.js';
		} else {
			$js_vars['worker'] 	= WC_POS()->plugin_url .'public/assets/js/worker.min.js?ver='. WooCommerce_POS::VERSION;
		}

		$pos_params = '
		<script type="text/javascript">
		var pos_params = ' . json_encode($js_vars) . '
		</script>
		';
		return $pos_params;
	}

	/**
	 * Print the CSS for public facing templates
	 */
	public function pos_print_css() {
		$html = '
	<link rel="stylesheet" href="'. WC_POS()->plugin_url .'public/assets/css/pos.min.css?ver='. WooCommerce_POS::VERSION .'" type="text/css" />
	<link rel="stylesheet" href="'. WC_POS()->plugin_url .'assets/css/font-awesome.min.css" type="text/css" />
		';
		echo $html;
	}

	/**
	 * Print the head JS for public facing templates
	 */
	public function print_head_js () {
		$html = '
<!-- Modernizr: checks: indexeddb, localstrorage, touch and CSS 3D transforms -->
<script src="'. WC_POS()->plugin_url .'public/assets/js/vendor/modernizr.custom.min.js"></script>
		';
		echo $html;
	}

	/**
	 * Print the footer JS for public facing templates
	 */
	public function print_footer_js () {
		echo $this->pos_localize_script();

		$html = '
<script src="//code.jquery.com/jquery-'. WooCommerce_POS::JQUERY_VERSION .'.min.js"></script>
<script>window.jQuery || document.write(\'<script src="'. WC_POS()->plugin_url .'public/assets/js/vendor/jquery-2.1.1.min.js">\x3C/script>\')</script>	
<script src="'. WC_POS()->plugin_url .'public/assets/js/plugins.min.js?ver='. WooCommerce_POS::VERSION .'"></script>
		';
		echo $html;

		// only include the app js on main page
		if( WC_POS()->template == 'main' ) {

			// switch for development
			if( WC_POS()->development ) {
				echo '<script data-main="'. WC_POS()->plugin_url .'public/assets/js/main" src="'. WC_POS()->plugin_url .'public/assets/js/require.js"></script>';
			} else {
				echo '<script src="'. WC_POS()->plugin_url .'public/assets/js/pos.min.js?ver='. WooCommerce_POS::VERSION .'"></script>';
			}
		}

		// include support.js on support page
		elseif ( WC_POS()->template == 'support' ) {
			echo '<script src="'. WC_POS()->plugin_url .'public/assets/js/support.min.js?ver='. WooCommerce_POS::VERSION .'"></script>';
		}
	}

}

new WooCommerce_POS_Template_Hooks();