<?php

/**
 * Admin Notices
 * - add notices via static method or filter
 *
 * @package    WCPOS\Admin_Notices
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin;

class Notices {

	/* @var */
	static private $notices = array();

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'admin_notices', array( $this, 'admin_notices' ) );
	}

	/**
	 * Add a message for display
	 *
	 * @param string $message
	 * @param string $type (error | warning | success | info)
	 * @param bool $dismissable
	 */
	static public function add( $message = '', $type = 'error', $dismissable = true ) {
		self::$notices[] = array(
			'type'        => $type,
			'message'     => $message,
			'dismissable' => $dismissable
		);
	}

	/**
	 * Display the admin notices
	 */
	public function admin_notices() {
		$notices = apply_filters( 'woocommerce_pos_admin_notices', self::$notices );
		if ( empty( $notices ) ) {
			return;
		}

		foreach ( $notices as $notice ):
			$classes = 'notice notice-' . $notice['type'];
			if ( $notice['dismissable'] ) {
				$classes .= ' is-dismissable';
			}
			if ( $notice['message'] ) {
				echo '<div class="' . $classes . '><p>' .
				     wp_kses( $notice['message'], wp_kses_allowed_html( 'post' ) ) .
				     '</p></div>';
			}
		endforeach;
	}

}
