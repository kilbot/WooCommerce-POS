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

  private $params;

  /**
   * Constructor
   * @param WC_POS_Gateways $gateways
   */
  public function __construct(WC_POS_Gateways $gateways) {
    $this->gateways = $gateways;

    add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
    add_action( 'template_redirect', array( $this, 'template_redirect' ) );

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
    if( ! current_user_can( 'access_woocommerce_pos' ) )
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

    // tack on debug & modernizr
    if(defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG){
      $styles['debug'] = '<script type="text/javascript">var wc_pos_debug = true;</script>';
    }
    $styles['modernizr-js'] = '<script src="'. WC_POS_PLUGIN_URL .'assets/js/vendor/modernizr.custom.min.js?ver='. WC_POS_VERSION .'"></script>';

    foreach( $styles as $style ) {
      echo "\n" . $style;
    }
  }

  /**
   * Output the footer scripts
   */
  protected function footer() {
    //
    $build = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'build' : 'min';

    // required scripts
    $scripts = array(
      'jquery'       => '<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>',
      'lodash'       => '<script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.3.1/lodash.min.js"></script>',
      'backbone'     => '<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js"></script>',
      'radio'        => '<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.radio/0.9.0/backbone.radio.min.js"></script>',
      'marionette'   => '<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.0/backbone.marionette.min.js"></script>',
      'handlebars'   => '<script src="//cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.0/handlebars.min.js"></script>',
      'idb-wrapper'  => '<script src="//cdnjs.cloudflare.com/ajax/libs/idbwrapper/1.4.1/idbstore.min.js"></script>',
      'select2'      => '<script src="//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js"></script>',
      'moment'       => '<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js"></script>',
      'accounting'   => '<script src="//cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js"></script>',
      'jquery.color' => '<script src="//cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js"></script>',
      'app'          => '<script src="'. WC_POS_PLUGIN_URL .'assets/js/app.'. $build .'.js?ver='. WC_POS_VERSION .'"></script>'
    );

    // get locale translation if available
    $locale_js = WC_POS_i18n::locale_js();
    if( $locale_js )
      $scripts['locale'] = '<script src="'. $locale_js .'?ver='. WC_POS_VERSION .'"></script>';

    // output
    $scripts = apply_filters( 'woocommerce_pos_footer', $scripts );
    foreach( $scripts as $script ) {
      echo "\n" . $script;
    }

    // inline start app with params
    echo '<script type="text/javascript">POS.options = '. json_encode( WC_POS_Params::frontend() ) .'; POS.start();</script>';
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
        /* translators: woocommerce */
        'label'  => __( 'Customers', 'woocommerce' ),
        'href'   => admin_url('users.php')
      ),
      'coupons' => array(
        /* translators: woocommerce */
        'label' => __( 'Coupons', 'woocommerce' ),
        'href'   => admin_url('edit.php?post_type=shop_coupon')
      ),
      'support' => array(
        /* translators: woocommerce */
        'label'  => __( 'Support', 'woocommerce' ),
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

  protected function print_tmpl(){
    $located = $this->wc_pos_locate_template('print/receipt.php');

    if ( ! file_exists( $located ) ) {
      return;
    }

    echo '<script type="text/x-handlebars-template" id="tmpl-print-receipt">';
    include $located;
    echo '</script>';
  }

  private function wc_pos_locate_template($tmpl){
    $template = locate_template(array(
      '/woocommerce-pos/' . $tmpl
    ));

    if( !$template ){
      $template = WC_POS_PLUGIN_PATH. 'includes/views/' . $tmpl;
    }

    return $template;
  }

}