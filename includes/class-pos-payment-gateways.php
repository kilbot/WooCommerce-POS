<?php
/**
 * WooCommerce POS Payment Gateways class
 *
 * Loads payment gateways via hooks for use in the store.
 * matches woocommerce/includes/class-wc-payment-gateways.php
 *
 * @class 		WooCommerce_POS_Payment_Gateways
 */
class WooCommerce_POS_Payment_Gateways {

	/** @var array Array of payment gateway classes. */
	var $gateways;
	var $available_gateways;

	/**
	 * @var WC_Payment_Gateways The single instance of the class
	 * @since 2.1
	 */
	protected static $instance = null;

	/**
	 * Main WC_Payment_Gateways Instance
	 *
	 * Ensures only one instance of WC_Payment_Gateways is loaded or can be loaded.
	 *
	 * @since 2.1
	 * @static
	 * @return WC_Payment_Gateways Main instance
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) )
			self::$instance = new self();
		return self::$instance;
	}

	/**
	 * Cloning is forbidden.
	 *
	 * @since 2.1
	 */
	public function __clone() {
		_doing_it_wrong( __FUNCTION__, __( 'Action not permitted', 'woocommerce-pos' ), '2.1' );
	}

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 2.1
	 */
	public function __wakeup() {
		_doing_it_wrong( __FUNCTION__, __( 'Action not permitted', 'woocommerce-pos' ), '2.1' );
	}

	/**
	 * __construct function.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->includes();

		$pos_only_gateways = apply_filters( 'woocommerce_pos_payment_gateways', array(
			'POS_Gateway_Cash',
			'POS_Gateway_Card'
		) );

		$global_gateways = WC()->payment_gateways()->payment_gateways;

		$this->gateways = array_merge( $pos_only_gateways, $global_gateways );
		$pos_only_gateways[] = $global_gateways[0];
		$this->available_gateways = $pos_only_gateways;
	}

    /**
     * Load gateways and hook in functions.
     *
     * @access public
     * @return void
     */
    function includes() {
    	include_once( WC_POS()->plugin_path . 'includes/gateways/cash/class-pos-gateway-cash.php' );
    	include_once( WC_POS()->plugin_path . 'includes/gateways/card/class-pos-gateway-card.php' );
    }

    /**
     * Return all gateways in order
     * @return array gateway objects
     */
    public function get_payment_gateways() {
    	$payment_gateways = array();

		// Get order option
		$ordering 	= (array) get_option('woocommerce_pos_gateway_order');
		$order_end 	= 999;

		// Load gateways in order
		foreach ($this->gateways as $gateway) :

			$load_gateway = new $gateway();

			if (isset($ordering[$load_gateway->id]) && is_numeric($ordering[$load_gateway->id])) :
				// Add in position
				$payment_gateways[$ordering[$load_gateway->id]] = $load_gateway;
			else :
				// Add to end of the array
				$payment_gateways[$order_end] = $load_gateway;
				$order_end++;
			endif;

		endforeach;

		ksort( $payment_gateways );

		return $payment_gateways;
    }


    /**
     * Return enabled gateways
     * @return array gateway ids
     */
    public function get_enabled_payment_gateways() {
    	$pos_gateways = array();

    	$enabled_gateways = (array) get_option( 'woocommerce_pos_pro_enabled_gateways', get_option( 'woocommerce_pos_enabled_gateways' ) );

    	foreach( $this->get_payment_gateways() as $gateway ) {
    		if( in_array( $gateway->id, $enabled_gateways )) {
    			$pos_gateways[ $gateway->id ] = $gateway;
    		}
    	}

    	return $pos_gateways;	
    }

    /**
     * WooCommerce POS shows all enabled Payment Gateways.
     * It may be necessary to check against supported products
     * at a later stage ...
     */
 	// function get_available_payment_gateways() {

	// 	$_available_gateways = array();

	// 	foreach ( $this->payment_gateways as $gateway ) :

	// 		if ( $gateway->is_available() ) {
	// 			if ( ! is_add_payment_method_page() )
	// 				$_available_gateways[$gateway->id] = $gateway;
	// 			elseif( $gateway->supports( 'add_payment_method' ) )
	// 				$_available_gateways[$gateway->id] = $gateway;
	// 		}

	// 	endforeach;

	// 	return apply_filters( 'woocommerce_available_payment_gateways', $_available_gateways );
	// }


}