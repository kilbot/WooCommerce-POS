<?php

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @class 	  WooCommerce_POS_Pro_Activator
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_Activator {

	public function __constructor() {
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );
	}

	/**
	 * Fired when the plugin is activated.
	 *
	 * @param $network_wide
	 */
	public static function activate( $network_wide ) {
		if ( function_exists( 'is_multisite' ) && is_multisite() ) {

			if ( $network_wide  ) {

				// Get all blog ids
				$blog_ids = self::get_blog_ids();

				foreach ( $blog_ids as $blog_id ) {

					switch_to_blog( $blog_id );
					self::single_activate();

					restore_current_blog();
				}

			} else {
				self::single_activate();
			}

		} else {
			self::single_activate();
		}
	}

	/**
	 * Fired when a new site is activated with a WPMU environment.
	 *
	 * @param $blog_id
	 */
	public function activate_new_site( $blog_id ) {

		if ( 1 !== did_action( 'wpmu_new_blog' ) ) {
			return;
		}

		switch_to_blog( $blog_id );
		self::single_activate();
		restore_current_blog();

	}

	/**
	 * Get all blog ids of blogs in the current network that are:
	 * - not archived
	 * - not spam
	 * - not deleted
	 */
	private static function get_blog_ids() {

		global $wpdb;

		// get an array of blog ids
		$sql = "SELECT blog_id FROM $wpdb->blogs
			WHERE archived = '0' AND spam = '0'
			AND deleted = '0'";

		return $wpdb->get_col( $sql );

	}

	/**
	 * Fired when the plugin is activated.
	 */
	public static function single_activate() {

		// Add rewrite rules, $this->generate_rewrite_rules not called on activation
		global $wp_rewrite;
		add_rewrite_rule('^pos/?$','index.php?pos=1','top');
		add_rewrite_rule('^pos/([^/]+)/?$','index.php?pos=1&pos_template=$matches[1]','top');
		flush_rewrite_rules( false ); // false will not overwrite .htaccess

		// add the manage_woocommerce_pos capability to administrator and shop_manager
		$administrator = get_role( 'administrator' );
		if( $administrator )
			$administrator->add_cap( 'manage_woocommerce_pos' );
		$shop_manager = get_role( 'shop_manager' );
		if( $shop_manager )
			$shop_manager->add_cap( 'manage_woocommerce_pos' );

		// set the auto redirection on next page load
		set_transient( 'woocommere_pos_welcome', 1, 30 );
	}

}

// load the wpmu_new_blog hook on file include
new WC_POS_Activator();