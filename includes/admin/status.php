<?php

/**
 * POS System Status Class
 *
 * @package    WCPOS\Admin_Status
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin;

use WCPOS\Template;

class Status extends Page {

	/* @var string JS var with page id, used for API requests */
	public $wcpos_adminpage = 'admin_system_status';

	/**
	 * @var array settings handlers
	 */
	static public $handlers = array(
		'tools' => '\WCPOS\Admin\Settings\Tools',
		'status' => '\WCPOS\Admin\Settings\Status'
	);

	/**
	 * Add Settings page to admin menu
	 */
	public function admin_menu() {
		$this->screen_id = add_submenu_page(
			\WCPOS\PLUGIN_NAME,
			/* translators: woocommerce */
			__( 'System Status', 'woocommerce' ),
			/* translators: woocommerce */
			__( 'System Status', 'woocommerce' ),
			'manage_woocommerce_pos',
			'wcpos_system_status',
			array( $this, 'display_system_status_page' )
		);

		parent::admin_menu();
	}

	/**
	 * Output the settings pages
	 */
	public function display_system_status_page() {
		include 'views/settings.php';
	}

	/**
	 * Returns array of settings classes
	 * @return mixed|void
	 */
	static public function handlers() {
		return apply_filters( 'woocommerce_pos_admin_system_status_handlers', self::$handlers );
	}

	/**
	 * Settings scripts
	 */
	public function enqueue_admin_scripts() {
		global $wp_scripts;
		$wp_scripts->queue = array();

		// deregister scripts
		wp_deregister_script( 'jquery' );
		wp_deregister_script( 'underscore' );
		wp_deregister_script( 'select2' );
		wp_deregister_script( 'backbone' );

		// register
		$external_libs = Template::get_external_js_libraries();
		wp_register_script( 'jquery', $external_libs['jquery'], false, null, true );
		wp_register_script( 'lodash', $external_libs['lodash'], array( 'jquery' ), null, true );
		wp_register_script( 'backbone', $external_libs['backbone'], array( 'jquery', 'lodash' ), null, true );
		wp_register_script( 'backbone.radio', $external_libs['radio'], array(
			'jquery',
			'backbone',
			'lodash'
		), null, true );
		wp_register_script( 'marionette', $external_libs['marionette'], array(
			'jquery',
			'backbone',
			'lodash'
		), null, true );
		wp_register_script( 'handlebars', $external_libs['handlebars'], false, null, true );
		wp_register_script( 'accounting', $external_libs['accounting'], false, null, true );

		$build = defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG ? 'build' : 'min';

		wp_enqueue_script(
			'eventsource-polyfill',
			\WCPOS\PLUGIN_URL . 'assets/js/vendor/eventsource.min.js',
			array(),
			null,
			true
		);

		wp_enqueue_script(
			\WCPOS\PLUGIN_NAME . '-admin-system-status-app',
			\WCPOS\PLUGIN_URL . 'assets/js/admin-system-status.' . $build . '.js',
			array( 'backbone', 'backbone.radio', 'marionette', 'handlebars', 'accounting', 'moment' ),
			\WCPOS\VERSION,
			true
		);
	}

}
