<?php

/**
 * WC REST API Class
 *
 * @package  WCPOS\API
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class API {

	/**
	 *
	 */
	public function __construct() {
//		$this->init();
	}


	/**
	 *
	 */
	private function init() {
		new \WCPOS\API\Products();
	}


	/**
	 *
	 */
//	private function init()
//	{
//		$controllers = array(
//			'\WCPOS\API\Legacy\v1\Users',
//		);
//
//		foreach ($controllers as $controller) {
//			$controller = new $controller();
//			$controller->register_routes();
//		}
//	}

}
