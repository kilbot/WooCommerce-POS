<?php

/**
 * Receipt Settings Class
 *
 * @package    WCPOS\Admin_Settings_Receipt_Options
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin\Settings\Receipt;

use WCPOS\Admin\Settings\Page;

class Options extends Page {

	protected static $instance;

	/**
	 * @param
	 */
	public function __construct() {
		$this->id    = 'receipt_options';
		$this->label = __( 'Receipt Options', 'woocommerce-pos' );

		$this->defaults = array(
			'print_method'      => 'browser',
			'template_language' => 'html'
		);
	}

}
