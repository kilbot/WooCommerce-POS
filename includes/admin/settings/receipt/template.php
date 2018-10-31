<?php

/**
 * Receipt Template Class
 *
 * @package    WCPOS\Admin_Settings_Receipt_Template
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin\Settings\Receipt;

use WCPOS\Admin\Settings\Page;

class Template extends Page {

	protected static $instance;

	/**
	 * @param
	 */
	public function __construct() {
		$this->id    = 'receipt_template';
		$this->label = __( 'Receipt Template', 'woocommerce-pos' );
	}

}
