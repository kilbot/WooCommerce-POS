<?php
/**
 * Customer Settings
 *
 * @class      WCPOS_Pro_Admin_Settings_Customers
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.wcpos.com
 */

namespace WCPOS\Admin\Settings;

class Cart extends Page {

	protected static $instance;

	public function __construct() {
		$this->id    = 'cart';
		$this->label = /* translators: woocommerce */
			__( 'Cart', 'woocommerce' );

		$this->defaults = array(
			'discount_quick_keys' => array( '5', '10', '20', '25' ),
			'shipping'            => array(
				'taxable' => true
			),
			'fee'                 => array(
				'taxable' => true
			)
		);
	}

}
