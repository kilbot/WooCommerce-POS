<?php

/**
 * Add a POS settings on the permalink admin page
 *
 * @package    WCPOS\Admin_Permlink
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin;

class Permalink {

	const DB_KEY = 'woocommerce_pos_settings_permalink';

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init();
		$this->save();
	}

	/**
	 * Hook into the permalinks setting api
	 */
	private function init() {
		add_settings_field(
			'woocommerce-pos-permalink',
			_x( 'POS base', 'Permalink setting, eg: /pos', 'woocommerce-pos' ),
			array( $this, 'pos_slug_input' ),
			'permalink',
			'optional'
		);
	}

	/**
	 * Output the POS field
	 */
	public function pos_slug_input() {
		$slug = self::get_slug();
		if ( $slug === 'pos' ) {
			$slug = '';
		} // use placeholder
		echo '<input name="woocommerce_pos_permalink" type="text" class="regular-text code" value="' . esc_attr( $slug ) . '" placeholder="pos" />';
	}

	/**
	 * Watch for $_POST and save POS setting
	 * - sanitize field and remove slash from start and end
	 */
	public function save() {
		if ( isset( $_POST['woocommerce_pos_permalink'] ) ) {
			$permalink = trim( sanitize_text_field( $_POST['woocommerce_pos_permalink'] ), '/\\' );
			update_option( self::DB_KEY, $permalink );
		}
	}

	/**
	 * Return the custom slug, defaults to 'pos'
	 * @return string
	 */
	static public function get_slug() {
		$slug = get_option( self::DB_KEY );

		return empty( $slug ) ? 'pos' : sanitize_text_field( $slug );
	}

}
