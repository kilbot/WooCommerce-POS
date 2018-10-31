<?php

/**
 * POS Support
 *
 * @package    WCPOS\API_Support
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\API;

use WC_API_Resource;
use WC_API_Server;

class Support extends WC_API_Resource {

	protected $base = '/pos/support';

	public $support_email = 'support@wcpos.com';


	/**
	 * Register routes for POS Params
	 *
	 * GET /pos
	 *
	 * @param array $routes
	 * @return array
	 */
	public function register_routes( array $routes ) {

		# POST /pos/support
		$routes[ $this->base ] = array(
			array( array( $this, 'send_support_email' ), WC_API_Server::CREATABLE | WC_API_Server::ACCEPT_DATA )
		);

		return $routes;

	}


	/**
	 * @param $data
	 * @return array|WP_Error
	 */
	public function send_support_email( $data ) {
		$name          = isset( $data['name'] ) ? $data['name'] : '';
		$email         = isset( $data['email'] ) ? $data['email'] : '';
		$message       = isset( $data['message'] ) ? $data['message'] : '';
		$append_report = isset( $data['append_report'] ) ? $data['append_report'] : false;
		$report        = isset( $data['report'] ) ? $data['report'] : '';

		$headers[] = 'From: ' . $name . ' <' . $email . '>';
		$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
		$message   = $message . "\n\n";

		if ( $append_report ) {
			$message .= $report;
			$message .= $this->get_active_plugins();
		}

		$support_email = apply_filters( 'woocommerce_pos_support_email', $this->support_email );

		if ( wp_mail( $support_email, 'WooCommerce POS Support', $message, $headers ) ) {
			return array(
				'result'  => 'success',
				'message' => __( 'Email sent', 'woocommerce-pos' )
			);
		}

		return new \WP_Error(
			'woocommerce_pos_email_error',
			__( 'There was an error sending the email', 'woocommerce-pos' ),
			array( 'status' => 400 )
		);
	}

	/**
	 *
	 */
	public function get_active_plugins() {
		$plugins = '*** Active Plugins ***' . "\n\n";

		$active_plugins = (array) get_option( 'active_plugins', array() );

		if ( is_multisite() ) {
			$network_activated_plugins = array_keys( get_site_option( 'active_sitewide_plugins', array() ) );
			$active_plugins            = array_merge( $active_plugins, $network_activated_plugins );
		}

		foreach ( $active_plugins as $plugin ) {
			$plugin_data = @get_plugin_data( WP_PLUGIN_DIR . '/' . $plugin );
			if ( ! empty( $plugin_data['Name'] ) ) {
				$plugins .= $plugin_data['Name'] . ': by ' . $plugin_data['Author'] . ' - ' . $plugin_data['Version'] . "\n";
			}
		}

		return $plugins;

	}

}
