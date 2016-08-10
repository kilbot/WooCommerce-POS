<?php

/**
 * Responsible for the POS front-end
 *
 * @class    WC_POS_Template
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS;

class Template {

  /** @var POS url slug */
  private $slug;

  /** @var regex match for rewite_rule */
  private $regex;

  /** @var WC_POS_Params instance */
  public $params;

  /** @var array external libraries */
  static public $external_libs = array(
    'min'   => array(
      'jquery'       => 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js',
      'lodash'       => 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js',
      'backbone'     => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js',
      'radio'        => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.5/backbone.radio.min.js',
      'marionette'   => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.7/backbone.marionette.min.js',
      'handlebars'   => 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js',
      'moment'       => 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js',
      'accounting'   => 'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js',
      'jquery.color' => 'https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js',
    ),
    'debug' => array(
      'jquery'       => 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.js',
      'lodash'       => 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js',
      'backbone'     => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone.js',
      'radio'        => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.5/backbone.radio.js',
      'marionette'   => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.7/backbone.marionette.js',
      'handlebars'   => 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.js',
      'moment'       => 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js',
      'accounting'   => 'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.js',
      'jquery.color' => 'https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.js',
    )
  );

  /**
   * Constructor
   */
  public function __construct() {
    $this->slug = Admin\Permalink::get_slug();
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
    if ( !is_pos( 'template' ) )
      return;

    // force ssl
    if(!is_ssl() && wc_pos_get_option('general', 'force_ssl')){
      wp_safe_redirect( wc_pos_url() );
      exit;
    }

    // check auth
    if ( !is_user_logged_in() ) {
      add_filter( 'login_url', array( $this, 'login_url' ) );
      auth_redirect();
    }

    // check privileges
    if ( !current_user_can( 'access_woocommerce_pos' ) )
      /* translators: wordpress */
      wp_die( __( 'You do not have sufficient permissions to access this page.' ) );

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
    if ( !defined( 'DONOTMINIFY' ) )
      define( "DONOTMINIFY", "true" );

    // disable WP Super Cache
    if ( !defined( 'DONOTCACHEPAGE' ) )
      define( "DONOTCACHEPAGE", "true" );
  }

  /**
   * @return array
   */
  static public function get_external_js_libraries() {
    return defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG ? self::$external_libs[ 'debug' ] : self::$external_libs[ 'min' ];
  }

  /**
   * Output the head scripts
   */
  public function head() {

    // enqueue and print javascript
    $styles = apply_filters( 'woocommerce_pos_enqueue_head_css', array(
      'pos-css'   => PLUGIN_URL . 'assets/css/pos.min.css?ver=' . VERSION
    ) );

    foreach ( $styles as $style ) {
      echo $this->format_css( trim( $style ) ) . "\n";
    }

    // enqueue and print javascript
    $js = array(
      'modernizr' => PLUGIN_URL . 'assets/js/vendor/modernizr.custom.min.js?ver=' . VERSION,
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
    $build = defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG ? 'build' : 'min';

    $js = self::get_external_js_libraries();
    $js[ 'app' ] = PLUGIN_URL . 'assets/js/app.' . $build . '.js?ver=' . VERSION;
    $scripts = apply_filters( 'woocommerce_pos_enqueue_footer_js', $js );

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
    if ( substr( $style, 0, 5 ) === '<link' )
      return $style;

    if ( substr( $style, 0, 4 ) === 'http' )
      return '<link rel="stylesheet" href="' . $style . '" type="text/css" />';

    return '<style>' . $style . '</style>';
  }

  /**
   * Makes sure javascript is in the right format for template
   *
   * @param $script
   * @return string
   */
  private function format_js( $script ) {
    if ( substr( $script, 0, 7 ) === '<script' )
      return $script;

    if ( substr( $script, 0, 4 ) === 'http' )
      return '<script src="' . $script . '"></script>';

    return '<script>' . $script . '</script>';
  }

}