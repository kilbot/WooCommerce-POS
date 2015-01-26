<?php
/**
 * Responsible for the POS front-end
 *
 * @class    WC_POS_Template
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Template {

	/**
	 * Constructor
	 */
	public function __construct() {

		add_filter( 'generate_rewrite_rules', array( $this, 'generate_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'template_redirect' ) );

	}

	/**
	 * Add rewrite rule to permalinks
	 *
	 * @param $wp_rewrite
	 */
	public function generate_rewrite_rules( $wp_rewrite ) {
		$option = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'permalink', 'pos' );
		$slug = empty($option) ? 'pos' : $option; // make sure slug not empty

		$custom_page_rules = array(
			'^'. $slug .'/?$' => 'index.php?pos=1',
		);
		$wp_rewrite->rules = $custom_page_rules + $wp_rewrite->rules;
	}

	/**
	 * Add pos variable to $wp global
	 *
	 * @param $public_query_vars
	 *
	 * @return array
	 */
	public function add_query_vars( $public_query_vars ) {
		$public_query_vars[] = 'pos';
		return $public_query_vars;
	}

	/**
	 * Output the POS template
	 */
	public function template_redirect() {
		// check is pos
		if( ! is_pos( 'template' ) )
			return;

		// check auth
		if( ! is_user_logged_in() )
			auth_redirect();

		// check privileges
		if( ! current_user_can( 'manage_woocommerce_pos' ) )
			/* translators: wordpress */
			wp_die( __( 'You do not have sufficient permissions to access this page.' ) );

		// disable cache plugins
		$this->no_cache();

		// last chance before template is rendered
		do_action( 'woocommerce_pos_template_redirect' );

		// now show the page
		include 'views/template.php';
		exit;

	}

	/**
	 * Disable caching conflicts
	 */
	private function no_cache() {

		// disable W3 Total Cache minify
		if ( ! defined( 'DONOTMINIFY' ) )
			define( "DONOTMINIFY", "true" );
	}

	/**
	 * Output the head scripts
	 */
	protected function head() {
		$styles = array(
			'pos-css'       => '<link rel="stylesheet" href="'. WC_POS_PLUGIN_URL .'assets/css/pos.min.css?ver='. WC_POS_VERSION .'" type="text/css" />',
			'icons-css'     => '<link rel="stylesheet" href="'. WC_POS_PLUGIN_URL .'assets/css/icons.min.css?ver='. WC_POS_VERSION .'" type="text/css" />',
		);
		$styles = apply_filters( 'woocommerce_pos_head', $styles );

		// tack on modernizr
		$styles['modernizr-js'] = '<script src="'. WC_POS_PLUGIN_URL .'assets/js/vendor/modernizr.custom.min.js?ver='. WC_POS_VERSION .'"></script>';

		foreach( $styles as $style ) {
			echo "\n" . $style;
		}
	}

	/**
	 * Output the footer scripts
	 */
	protected function footer() {
		// required scripts
		$scripts = array(
			'jquery-js'         => '<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>',
			'lodash-js'         => '<script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js"></script>',
			'backbone-js'       => '<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js"></script>',
			'handlebars'        => '<script src="//cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js"></script>',
			'select2'           => '<script src="//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js"></script>',
			'moment'            => '<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js"></script>',
			'accounting'        => '<script src="//cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js"></script>',
			'jquery.color'      => '<script src="//cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js"></script>',
			'core-js'           => '<script src="'. WC_POS_PLUGIN_URL .'assets/js/core.build.js?ver='. WC_POS_VERSION .'"></script>',
			'app-js'            => '<script src="'. WC_POS_PLUGIN_URL .'assets/js/app.build.js?ver='. WC_POS_VERSION .'"></script>'
		);

		// get locale translation if available
		$locale_js = WC_POS_i18n::locale_js();
		if( $locale_js )
			$scripts['locale-js'] = '<script src="'. $locale_js .'?ver='. WC_POS_VERSION .'"></script>';

		// output
		$scripts = apply_filters( 'woocommerce_pos_footer', $scripts );
		foreach( $scripts as $script ) {
			echo "\n" . $script;
		}

		// inline start app with params
		$registry = WC_POS_Registry::instance();
		$params = $registry->get('params');
		echo '<script type="text/javascript">POS.start('. json_encode( $params->frontend() ) .');</script>';
	}

	/**
	 * Output the side menu
	 */
	protected function menu() {
		$menu = array(
			'pos' => array(
				'label'  => __( 'POS', 'woocommerce-pos' ),
				'href'   => '#'
			),
			'products' => array(
				/* translators: woocommerce */
				'label'  => __( 'Products', 'woocommerce' ),
				'href'   => admin_url('edit.php?post_type=product')
			),
			'orders' => array(
				/* translators: woocommerce */
				'label'  => __( 'Orders', 'woocommerce' ),
				'href'   => admin_url('edit.php?post_type=shop_order')
			),
			'customers' => array(
				/* translators: woocommerce-admin */
				'label'  => __( 'Customers', 'woocommerce-admin' ),
				'href'   => admin_url('users.php')
			),
			'coupons' => array(
				/* translators: woocommerce */
				'label' => __( 'Coupons', 'woocommerce' ),
				'href'   => admin_url('edit.php?post_type=shop_coupon')
			),
			'support' => array(
				/* translators: woocommerce-admin */
				'label'  => __( 'Support', 'woocommerce-admin' ),
				'href'   => '#support'
			),
		);

		return apply_filters( 'woocommerce_pos_menu', $menu );
	}

	/**
	 * Output the header title
	 */
	protected function title() {
		echo apply_filters( 'woocommerce_pos_title', get_bloginfo( 'name' ) );
	}

	/**
	 * Include the javascript templates
	 */
	protected function js_tmpl() {
		$templates = array(
			'views/pos.php',
			'views/support.php',
			'views/help.php'
		);
		$templates = apply_filters( 'woocommerce_pos_js_tmpl', $templates );
		foreach($templates as $template) {
			include $template;
		}
	}

	/**
	 * Payment gateways templates
	 */
	protected function gateways(){
		$registry = WC_POS_Registry::instance();
		$payment_gateways = $registry->get('gateways');
		return $payment_gateways->enabled_gateways();
	}
}