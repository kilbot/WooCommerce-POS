<?php

/**
 * Global helper functions for WooCommerce POS
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.wcpos.com
 *
 */

/**
 * Construct the POS permalink
 *
 * @param string $page
 *
 * @return string|void
 */
if ( ! function_exists( 'wcpos_url' ) ) {
	function wcpos_url( $page = '' ) {
		$slug   = WCPOS\Admin\Permalink::get_slug();
		$scheme = wcpos_get_option( 'general', 'force_ssl' ) == true ? 'https' : null;

		return home_url( $slug . '/' . $page, $scheme );
	}
}

/**
 * Test for POS requests to the server
 *
 * @param $type
 *
 * @return bool
 */
if ( ! function_exists( 'is_pos' ) ) {
	function is_pos( $type = false ) {

		// test for template requests, ie: matched rewrite rule
		// also matches $_GET & $_POST for pos=1
		if ( $type == 'template' || ! $type ) {
			global $wp;
			if ( isset( $wp->query_vars['pos'] ) && $wp->query_vars['pos'] == 1 ) {
				return true;
			}
		}

		// test for WC REST API requests, ie: matched request header
		if ( $type == 'ajax' || ! $type ) {
			// check server global first
			if ( isset( $_SERVER['HTTP_X_WCPOS'] ) && $_SERVER['HTTP_X_WCPOS'] == 1 ) {
				return true;
			}
			// backup check getallheaders() - can cause problems
			if ( function_exists( 'getallheaders' ) && is_array( getallheaders() ) && array_key_exists( 'X-WCPOS', getallheaders() ) ) {
				return true;
			}
		}

		return false;
	}
}

/**
 *
 */
if ( ! function_exists( 'is_pos_admin' ) ) {
	function is_pos_admin() {
		if ( function_exists( 'getallheaders' )
		     && $headers = getallheaders()
		                   && isset( $headers['X-WC-POS-ADMIN'] )
		) {
			return $headers['X-WC-POS-ADMIN'];
		} elseif ( isset( $_SERVER['HTTP_X_WCPOS_ADMIN'] ) ) {
			return $_SERVER['HTTP_X_WCPOS_ADMIN'];
		}

		return false;
	}
}

/**
 * Add or update a WordPress option.
 * The option will _not_ auto-load by default.
 *
 * @param string $name
 * @param mixed $value
 * @param string $autoload
 * @return bool
 */
if ( ! function_exists( 'wcpos_update_option' ) ) {
	function wcpos_update_option( $name, $value, $autoload = 'no' ) {
		$success = add_option( $name, $value, '', $autoload );

		if ( ! $success ) {
			$success = update_option( $name, $value );
		}

		return $success;
	}
}

/**
 * Simple wrapper for json_encode
 *
 * Use JSON_FORCE_OBJECT for PHP 5.3 or higher with fallback for
 * PHP less than 5.3.
 *
 * WP 4.1 adds some wp_json_encode sanity checks which may be
 * useful at some later stage.
 *
 * @param $data
 * @return mixed
 */
if ( ! function_exists( 'wcpos_json_encode' ) ) {
	function wcpos_json_encode( $data ) {
		$args = array( $data, JSON_FORCE_OBJECT );

		return call_user_func_array( 'json_encode', $args );
	}
}

/**
 * Return template path
 *
 * @param string $path
 * @return mixed|void
 */
if ( ! function_exists( 'wcpos_locate_template' ) ) {
	function wcpos_locate_template( $path = '' ) {
		$template = locate_template( array(
			'woocommerce-pos/' . $path
		) );

		if ( ! $template ) {
			$template = WCPOS_PLUGIN_PATH . 'includes/views/' . $path;
		}

		if ( file_exists( $template ) ) {
			return apply_filters( 'woocommerce_pos_locate_template', $template, $path );
		}
	}
}

/**
 * @param $id
 * @param $key
 * @return bool
 */
if ( ! function_exists( 'wcpos_get_option' ) ) {
	function wcpos_get_option( $id, $key = false ) {
		$handlers = (array) WCPOS\Admin\Settings::handlers();
		if ( ! array_key_exists( $id, $handlers ) ) {
			return false;
		}

		$settings = $handlers[ $id ]::get_instance();

		return $settings->get( $key );
	}
}

/**
 * Remove newlines and code spacing
 *
 * @param $str
 * @return mixed
 */
if ( ! function_exists( 'wcpos_trim_html_string' ) ) {
	function wcpos_trim_html_string( $str ) {
		return preg_replace( '/^\s+|\n|\r|\s+$/m', '', $str );
	}
}

/**
 *
 */
if ( ! function_exists( 'wcpos_doc_url' ) ) {
	function wcpos_doc_url( $page ) {
		return 'http://docs.wcpos.com/v/' . \WCPOS\VERSION . '/en/' . $page;
	}
}

/**
 *
 */
if ( ! function_exists( 'wcpos_faq_url' ) ) {
	function wcpos_faq_url( $page ) {
		return 'http://faq.wcpos.com/v/' . \WCPOS\VERSION . '/en/' . $page;
	}
}
