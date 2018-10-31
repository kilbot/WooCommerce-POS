<?php

/**
 * POS Settings Class
 *
 * @package    WCPOS\Admin_Settings
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin;

use WCPOS\Template;

class Settings extends Page {

	/* @var string JS var with page id, used for API requests */
	public $wcpos_adminpage = 'admin_settings';

	/**
	 * @var array settings handlers
	 */
	static public $handlers = array(
		'general'   => '\WCPOS\Admin\Settings\General',
		'products'  => '\WCPOS\Admin\Settings\Products',
		'cart'      => '\WCPOS\Admin\Settings\Cart',
		'customers' => '\WCPOS\Admin\Settings\Customers',
		'checkout'  => '\WCPOS\Admin\Settings\Checkout',
		'receipts'  => '\WCPOS\Admin\Settings\Receipts',
		'hotkeys'   => '\WCPOS\Admin\Settings\HotKeys',
		'access'    => '\WCPOS\Admin\Settings\Access'
	);

	/**
	 * Add Settings page to admin menu
	 */
	public function admin_menu() {
		$this->screen_id = add_submenu_page(
			\WCPOS\PLUGIN_NAME,
			/* translators: wordpress */
			__( 'Settings' ),
			/* translators: wordpress */
			__( 'Settings' ),
			'manage_woocommerce_pos',
			'wcpos_settings',
			array( $this, 'display_settings_page' )
		);

		parent::admin_menu();
	}

	/**
	 * Output the settings pages
	 */
	public function display_settings_page() {
		include 'views/settings.php';
	}

	/**
	 * Returns array of settings classes
	 * @return mixed|void
	 */
	static public function handlers() {
		return apply_filters( 'woocommerce_pos_admin_settings_handlers', self::$handlers );
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

		$build = defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG ? 'build' : 'min';

		// register
		$external_libs = Template::get_external_js_libraries();
		wp_register_script( 'jquery', $external_libs['jquery'], false, null, false );
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
		wp_register_script( 'moment', $external_libs['moment'], false, null, true );
		wp_register_script( 'accounting', $external_libs['accounting'], false, null, true );
		wp_register_script( 'select2', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.full.min.js', array( 'jquery' ), null, true );
		wp_register_script( 'ace', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js', false, null, true );
		wp_register_script( 'qz-tray', \WCPOS\PLUGIN_URL . '/assets/js/vendor/qz-tray.' . $build . '.js', false, null, true );

		wp_enqueue_script(
			\WCPOS\PLUGIN_NAME . '-admin-settings-app',
			\WCPOS\PLUGIN_URL . 'assets/js/admin-settings.' . $build . '.js',
			array(
				'backbone',
				'backbone.radio',
				'marionette',
				'handlebars',
				'accounting',
				'moment',
				'select2',
				'ace',
				'qz-tray'
			),
			\WCPOS\VERSION,
			true
		);

		// enqueue jquery UI sortable
		wp_enqueue_script( 'jquery-ui-sortable' );

		// localise moment
		if ( isset( $external_libs['moment-locale'] ) ) {
			wp_enqueue_script(
				'moment-locale',
				$external_libs['moment-locale'],
				array( \WCPOS\PLUGIN_NAME . '-admin-settings-app' ),
				\WCPOS\VERSION,
				true
			);
		}

		// localise select2
		$select2_locale_js = \WCPOS\i18n::get_external_library_locale_js( 'select2', '4.0.3' );

		if ( $select2_locale_js ) {
			wp_enqueue_script(
				'select2-locale',
				$select2_locale_js,
				array( \WCPOS\PLUGIN_NAME . '-admin-settings-app' ),
				\WCPOS\VERSION,
				true
			);
			// select2 requires matching locale <-> filename
			$select2_locale = strstr( basename( $select2_locale_js ), '.', true );
			wp_add_inline_script( 'select2', "$.fn.select2.defaults.set('language', '" . $select2_locale . "');" );
		}

	}

}
