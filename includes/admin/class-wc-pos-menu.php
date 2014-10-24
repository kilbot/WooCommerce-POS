<?php

/**
* WP Admin Menu Class
*
* @class    WC_POS_Admin_Menu
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Admin_Menu {

	/** @vars string Unique menu identifiers */
	static public $menu_parent;
	static public $toplevel_screen_id;
	static public $settings_screen_id;

	/**
	 * Constructor
	 */
	public function __construct() {
		self::$menu_parent = 'woocommerce-pos';
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
	}

	/**
	 * Add POS to admin menu
	 */
	public function admin_menu() {
		global $submenu;

		if( !current_user_can( 'manage_woocommerce_pos' ) )
			return;

		self::$toplevel_screen_id = add_menu_page(
			__( 'POS', 'woocommerce-pos' ),
			__( 'POS', 'woocommerce-pos' ),
			'manage_woocommerce_pos',
			self::$menu_parent,
			array( $this, 'display_upgrade_page' ),
			'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDI0IDEwMjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnIGlkPSJpY29tb29uLWlnbm9yZSI+PC9nPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik05NTAuODU2LDBDOTQ4LjA1MiwwLDc2LjI4OCwwLDczLjE0LDBDMzIuNzQ0LDAtMC4wMDQsMzIuNzQ2LTAuMDA0LDczLjE0NHYxMDkuNTljMCw0MC4zOTYsMzIuNzQ2LDczLjE0NCw3My4xNDQsNzMuMTQ0czczLjE0NC0zMi43NDgsNzMuMTQ0LTczLjE0NGgtMC4wMDJWNTEuMmgxNDYuMjg2djEzMS41MzRjMCw0MC4zOTYsMzIuNzQ5LDczLjE0NCw3My4xNDQsNzMuMTQ0YzQwLjM5NiwwLDczLjE0NC0zMi43NDgsNzMuMTQ0LTczLjE0NGwwLDBWNTEuMkg1ODUuMTR2MTMxLjUzNGMwLDQwLjM5NiwzMi43NDYsNzMuMTQ0LDczLjE0NSw3My4xNDRjNDAuMzk3LDAsNzMuMTQ0LTMyLjc0OCw3My4xNDQtNzMuMTQ0VjUxLjJoMTQ2LjI4NnYxMzEuNTM0YzAsNDAuMzk2LDMyLjc0Niw3My4xNDQsNzMuMTQ0LDczLjE0NGM0MC4zOTgsMCw3My4xNDUtMzIuNzQ2LDczLjE0NS03My4xNDRWNzMuMTQ0QzEwMjQuMDAyLDMyLjc0OCw5OTEuMjU0LDAsOTUwLjg1OCwwSDk1MC44NTZ6IE0yMzUuNDMsNDUzLjc4NGMtNDQuNjIyLDAtNzkuMDI4LDM0Ljk0My03OS4wMjgsNzkuNTYzczM0LjQwNiw3OS41NjYsNzkuMDI4LDc5LjU2NmM0NC42MjIsMCw3OS41NjYtMzQuOTQ0LDc5LjU2Ni03OS41NjZDMzE0Ljk5Niw0ODguNzI5LDI4MC4wNTIsNDUzLjc4NCwyMzUuNDMsNDUzLjc4NEwyMzUuNDMsNDUzLjc4NHogTTk1MC44NTYsMjkwLjAxYy0yNy4zOTUsMC01My4yMjMtMTAuMTk4LTczLjE0NS0yOC43OThjLTE5LjkyNCwxOC42LTQ1Ljc1LDI4Ljc5OC03My4xNDQsMjguNzk4Yy0yNy4zOTUsMC01My4yMjMtMTAuMTk4LTczLjE0NS0yOC43OThjLTE5LjkyNCwxOC42LTQ1Ljc1LDI4Ljc5OC03My4xNDQsMjguNzk4Yy0yNy4zOTUsMC01My4yMi0xMC4xOTgtNzMuMTQ1LTI4Ljc5OGMtMTkuOTI0LDE4LjYtNDUuNzQ4LDI4Ljc5OC03My4xNDQsMjguNzk4Yy0yNy4zOTYsMC01My4yMi0xMC4yLTczLjE0NS0yOC43OThjLTE5LjkyNCwxOC42LTQ1Ljc1LDI4Ljc5OC03My4xNDQsMjguNzk4cy01My4yMi0xMC4yLTczLjE0NC0yOC43OThjLTE5LjkyNCwxOC42LTQ1Ljc0OCwyOC43OTgtNzMuMTQ0LDI4Ljc5OHMtNTMuMjItMTAuMi03My4xNDQtMjguNzk4Yy0xOS45MjQsMTguNi00NS43NSwyOC43OTgtNzMuMTQ0LDI4Ljc5OGMtMjcuMzk0LDAtNTMuMjItMTAuMjA2LTczLjE0NC0yOC44MDh2NzYyLjhsMjkyLjY5Mi0yMDMuNjY0aDY1OC4wOGM0MC40NDIsMCw3My4yMjctMzIuNzg0LDczLjIyNy03My4yMjZWMjYxLjIwNGMtMTkuOTI0LDE4LjYwNC00NS43NDYsMjguODA4LTczLjE0NSwyOC44MDhMOTUwLjg1NiwyOTAuMDF6IE0yMzUuNDMsNjcxLjUxNGMtMzAuMTA2LDAtNTcuNTI0LTkuNjc4LTc5LjU2Ni0yNS44MDR2OTguMzhjMCwyMC45NjYtMTMuNDQsMzMuMzMyLTI5LjU2OCwzMy4zMzJjLTE4LjI3OCwwLTI5LjU2OC0xMy45NzgtMjkuNTY4LTMzLjMzMnYtMzE0LjVjMC0xOC44MTYsMTIuOTAyLTMyLjc5NCwyOS41NjgtMzIuNzk0YzEyLjM2NCwwLDIzLjExOCw1LjkxNCwyNi44OCwyNS4yNjljMjIuMDQyLTE2LjY2Nyw1MC41MzQtMjcuNDE4LDgyLjI1NC0yNy40MThjNzYuODc3LDAsMTM5LjIzOCw2MS44MjYsMTM5LjIzOCwxMzguNzA0YzAsNzYuMzQtNjIuMzYyLDEzOC4xNjQtMTM5LjI0LDEzOC4xNjRIMjM1LjQzeiBNNTY0LjQzMiw2NzIuMDUyYy03Ny40MTYsMC0xMzkuMjM5LTYxLjgyMS0xMzkuMjM5LTEzOS4yMzljMC03Ni4zNDEsNjEuODIzLTEzOC4xNjUsMTM5LjIzOS0xMzguMTY1Yzc2LjM0LDAsMTM4LjE2NCw2MS44MjQsMTM4LjE2NCwxMzguMTY1QzcwMi41OTYsNjEwLjIyNiw2NDAuNzc0LDY3Mi4wNTIsNTY0LjQzMiw2NzIuMDUyeiBNODM5LjE0Miw2NzIuMDUyYy01MS4wNzMsMC04Ny4wOTItMjYuODgtODcuMDkyLTUzLjc2YzAtMTMuOTc4LDEwLjc1NC0yNS4yNjQsMjYuODgtMjUuMjY0YzIzLjY1NCwwLDMyLjc5NCwyNC4xOTEsNjIuMzYyLDI0LjE5MWMyMC40MjgsMCwyOS41NjgtMTAuNzUyLDI5LjU2OC0yMS41MDRjMC0xMC4yMTQtNy41MjYtMjEuNTA0LTM1LjQ4Mi0zNi4wMmwtMjUuMjY4LTEyLjkwMmMtNDEuMzk2LTIwLjk2Ni01NS4zNzQtNDUuMTU4LTU1LjM3NC03Ni44NzhjMC0zOC4xNjgsMzQuNDA1LTc0LjcyNiw4OS43NzktNzQuNzI2YzU4LjA2MiwwLDgxLjE3OSwzNS40ODIsODEuMTc5LDUxLjYwOGMwLDEzLjQ0LTEwLjIxNywyNC4xOTItMjYuMzQzLDI0LjE5MmMtMjEuNTA0LDAtMzQuNDA1LTE4LjgxNi02MS4yODUtMTguODE2Yy0xMy45NzksMC0yMC45NjcsOS42NzgtMjAuOTY3LDE4LjI3OGMwLDExLjI5LDUuOTE0LDE3LjIwMiwyOS4wMywzMC42NDJsNi40NTIsMy43NjJjOC42MDIsNS4zNzcsMTkuMzU0LDkuNjc3LDI4LjQ5NCwxNS4wNTVjNDAuODU3LDIyLjA0Miw1MS4wNzQsNDguMzg0LDUxLjA3NCw3NS4yNjRjLTAuMDA0LDM4LjcwNi0zMC42NDgsNzYuODc2LTkzLjAwOSw3Ni44NzZWNjcyLjA1MnogTTU2NC40MzIsNDU0LjMyMmMtNDQuNjE5LDAtNzkuNTYzLDM0Ljk0My03OS41NjMsNzguNDljMCw0NC42MTksMzQuOTQ0LDc5LjU2Myw3OS41NjMsNzkuNTYzYzQzLjU0NCwwLDc4LjQ5LTM0Ljk0NCw3OC40OS03OS41NjVjMC4wMDItNDMuNTQ3LTM0Ljk0MS03OC40OS03OC40OS03OC40OVY0NTQuMzIyeiIvPjwvc3ZnPg==',
			'55.55'
		);

		self::$settings_screen_id = add_submenu_page(
			self::$menu_parent,
			__( 'Settings', 'woocommerce-pos' ),
			__( 'Settings', 'woocommerce-pos' ),
			'manage_woocommerce_pos',
			'wc_pos_settings',
			array( $this, 'display_settings_page' )
		);

		$submenu[self::$menu_parent][0][0] = __( 'Upgrade to Pro', 'woocommerce-pos' );
		$submenu[self::$menu_parent][500] = array( __( 'View POS', 'woocommerce-pos' ), 'manage_woocommerce_pos' , wc_pos_url() );
	}

	/**
	 * Render the upgrade page.
	 */
	public function display_upgrade_page() {

		// Check for transient, if none, grab remote HTML file
		if ( false === ( $upgrade = get_transient( 'remote_pro_page' ) ) ) {
			// Get remote HTML file
			$response = wp_remote_get( 'http://woopos.com.au/pro/?wp-admin=woocommerce-pos' );
			// Check for error
			if ( is_wp_error( $response ) ) {
				return;
			}
			// Parse remote HTML file
			$upgrade = wp_remote_retrieve_body( $response );
			// Check for error
			if ( is_wp_error( $upgrade ) ) {
				return;
			}
			// Store remote HTML file in transient, expire after 24 hours
			set_transient( 'remote_pro_page', $upgrade, 24 * HOUR_IN_SECONDS );
		}
		include_once 'views/upgrade.php';
	}

	/**
	 * Render the settings page for this plugin.
	 */
	public function display_settings_page() {
		WC_POS_Admin_Settings::display_settings_page();
	}

}