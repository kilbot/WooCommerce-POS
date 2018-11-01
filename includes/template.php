<?php

/**
 * Responsible for the POS front-end
 *
 * @package    WCPOS\Template
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class Template {

	/** @var POS url slug */
	private $slug;

	/** @var regex match for rewite_rule */
	private $regex;

	/** @var WCPOS_Params instance */
	public $params;


	/**
	 * Constructor
	 */
	public function __construct() {
		$this->slug  = Admin\Permalink::get_slug();
		$this->regex = '^' . $this->slug . '/?$';

		add_rewrite_tag( '%pos%', '([^&]+)' );
		add_rewrite_rule( $this->regex, 'index.php?pos=1', 'top' );
		add_filter( 'option_rewrite_rules', array( $this, 'rewrite_rules' ), 1 );
		add_action( 'template_redirect', array( $this, 'template_redirect' ), 1 );
	}


	/**
	 * Make sure cache contains POS rewrite rule
	 *
	 * @param $rules
	 * @return bool
	 */
	public function rewrite_rules( $rules ) {
		return isset( $rules[ $this->regex ] ) ? $rules : false;
	}


	/**
	 * Output the POS template
	 */
	public function template_redirect() {
		// check is pos
		if ( ! is_pos( 'template' ) ) {
			return;
		}

		// force ssl
//		if ( ! is_ssl() && wcpos_get_option( 'general', 'force_ssl' ) ) {
		if ( ! is_ssl() ) {
			wp_safe_redirect( wcpos_url() );
			exit;
		}

		// check auth
		if ( ! is_user_logged_in() ) {
			add_filter( 'login_url', array( $this, 'login_url' ) );
			auth_redirect();
		}

		// check privileges
		if ( ! current_user_can( 'access_woocommerce_pos' ) ) /* translators: wordpress */ {
			wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
		}

		// disable cache plugins
		$this->no_cache();

		// last chance before template is rendered
		do_action( 'woocommerce_pos_template_redirect' );

		// add head & footer actions
		add_action( 'woocommerce_pos_head', array( $this, 'head' ) );
		add_action( 'woocommerce_pos_footer', array( $this, 'footer' ) );

		// now show the page
		include 'views/main.php';
		exit;

	}


	/**
	 * Add variable to login url to signify POS login
	 *
	 * @param $login_url
	 * @return mixed
	 */
	public function login_url( $login_url ) {
		return add_query_arg( 'pos', '1', $login_url );
	}


	/**
	 * Disable caching conflicts
	 */
	private function no_cache() {
		// disable W3 Total Cache minify
		if ( ! defined( 'DONOTMINIFY' ) ) {
			define( "DONOTMINIFY", "true" );
		}

		// disable WP Super Cache
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( "DONOTCACHEPAGE", "true" );
		}
	}


	/**
	 * @return array
	 */
	static public function get_external_js_libraries() {
		$libs = defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG ? self::$external_libs['debug'] : self::$external_libs['min'];

		// add moment js locale if available
		$moment_locale_js = i18n::get_external_library_locale_js( 'moment', '2.17.1' );

		if ( $moment_locale_js ) {
			$libs['moment-locale'] = $moment_locale_js;
		}

		return apply_filters( 'woocommerce_pos_external_js_libraries', $libs );
	}


	/**
	 * Output the head scripts
	 */
	public function head() {

		// enqueue and print javascript
		$styles = apply_filters( 'woocommerce_pos_enqueue_head_css', array() );

		foreach ( $styles as $style ) {
			echo $this->format_css( trim( $style ) ) . "\n";
		}

		// enqueue and print javascript
		$js = array(//			'modernizr' => PLUGIN_URL . 'assets/js/vendor/modernizr.custom.min.js?ver=' . VERSION,
		);

		$scripts = apply_filters( 'woocommerce_pos_enqueue_head_js', $js );
		foreach ( $scripts as $script ) {
			echo $this->format_js( trim( $script ) ) . "\n";
		}
	}


	/**
	 * Output the footer scripts
	 */
	public function footer() {
//		$build = defined('\SCRIPT_DEBUG') && \SCRIPT_DEBUG ? 'build' : 'min';

//		$js = self::get_external_js_libraries();

		// add qz-tray?
//		$receipt_options = wcpos_get_option('receipts', 'receipt_options');
//		if (isset($receipt_options['print_method']) && $receipt_options['print_method'] == 'qz-tray') {
//			$js['qz-tray'] = PLUGIN_URL . '/assets/js/vendor/qz-tray.' . $build . '.js';
//		}



		$js['runtime'] = PLUGIN_URL . 'assets/js/runtime.js?ver=' . VERSION;
		$js['vendor']  = PLUGIN_URL . 'assets/js/vendor.js?ver=' . VERSION;
		$js['app']     = PLUGIN_URL . 'assets/js/app.js?ver=' . VERSION;
		$scripts       = apply_filters( 'woocommerce_pos_enqueue_footer_js', $js );

		foreach ( $scripts as $script ) {
			echo $this->format_js( trim( $script ) ) . "\n";
		}
	}


	/**
	 * Makes sure css is in the right format for template
	 *
	 * @param $style
	 * @return string
	 */
	private function format_css( $style ) {
		if ( substr( $style, 0, 5 ) === '<link' ) {
			return $style;
		}

		if ( substr( $style, 0, 4 ) === 'http' ) {
			return '<link rel="stylesheet" href="' . $style . '" type="text/css" />';
		}

		return '<style>' . $style . '</style>';
	}


	/**
	 * Makes sure javascript is in the right format for template
	 *
	 * @param $script
	 * @return string
	 */
	private function format_js( $script ) {
		if ( substr( $script, 0, 7 ) === '<script' ) {
			return $script;
		}

		if ( substr( $script, 0, 4 ) === 'http' ) {
			return '<script src="' . $script . '"></script>';
		}

		return '<script>' . $script . '</script>';
	}

}
