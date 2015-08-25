<?php

/**
 * Responsible for the POS front-end
 * todo: clean up
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
    add_action( 'template_redirect', array( $this, 'template_redirect' ), 1 );
  }

  /**
   * Output the POS template
   */
  public function template_redirect() {
    // check is pos
    if( ! is_pos( 'template' ) )
      return;

    // check auth
    if( ! is_user_logged_in() ){
      add_filter( 'login_url', array( $this, 'login_url' ) );
      auth_redirect();
    }

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
   * Add variable to login url to signify POS login
   * @param $login_url
   * @return mixed
   */
  public function login_url( $login_url ){
    return add_query_arg( 'pos', '1', $login_url );
  }

  /**
   * Disable caching conflicts
   */
  private function no_cache() {

    // disable W3 Total Cache minify
    if ( ! defined( 'DONOTMINIFY' ) )
      define( "DONOTMINIFY", "true" );

    // disable WP Super Cache
    if ( ! defined( 'DONOTCACHEPAGE' ) )
      define( "DONOTCACHEPAGE", "true" );
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
      'jquery'       => 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
      'lodash'       => 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js',
      'backbone'     => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.2/backbone-min.js',
      'radio'        => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.1/backbone.radio.min.js',
      'marionette'   => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.2/backbone.marionette.min.js',
      'handlebars'   => 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.3/handlebars.min.js',
//      now using customised idb-wrapper
//      'idb-wrapper'  => 'https://cdnjs.cloudflare.com/ajax/libs/idbwrapper/1.5.0/idbstore.min.js',
      'select2'      => 'https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js',
      'moment'       => 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js',
      'accounting'   => 'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js',
      'jquery.color' => 'https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js',
      'app'          => WC_POS_PLUGIN_URL .'assets/js/app.'. $build .'.js?ver='. WC_POS_VERSION
    );

    // cdn bundle for local dev
    // todo: formatNumber issue when using vendor bundle
//    $scripts = array(
//      'bundle'       => WC_POS_PLUGIN_URL .'assets/js/vendor.bundle.js?ver='. WC_POS_VERSION,
//      'app'          => WC_POS_PLUGIN_URL .'assets/js/app.'. $build .'.js?ver='. WC_POS_VERSION
//    );

    // output scripts
    $scripts = apply_filters( 'woocommerce_pos_enqueue_scripts', $scripts );

    foreach( $scripts as $script ) {
      echo "\n".'<script src="'. $script . '"></script>';
    }

    // inline start app with params
    $params = new WC_POS_Params();
    $inline = array(
      'start' => '<script type="text/javascript">POS.options = '. $params->toJSON() .'; POS.start();</script>'
    );

    $inline_js = apply_filters( 'woocommerce_pos_inline_js', $inline );

    // output inline js
    foreach( $inline_js as $js ) {
      echo "\n".$js;
    }
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
      )
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
    if( $located = wc_pos_locate_template('print/receipt.php') ){
      echo '<script type="text/x-handlebars-template" id="tmpl-print-receipt">';
      include $located;
      echo '</script>';
    }
  }

  /**
   * Get ordered, enabled gateways from the checkout settings
   * @return array
   */
  protected function gateways(){
    $settings = WC_POS_Admin_Settings_Checkout::get_instance();
    return $settings->load_enabled_gateways();
  }

  /**
   * Sanitize payment icon
   * - some gateways include junk in icon property, eg: paypal link
   * @param WC_Payment_Gateway $gateway
   * @return string
   */
  protected function sanitize_icon(WC_Payment_Gateway $gateway){
    $icon = $gateway->show_icon ? $gateway->get_icon() : '';
    if($icon !== ''){
      // simple preg_match
      preg_match('/< *img[^>]*src *= *["\']?([^"\']*)/i', $icon, $src);
      $icon = $src[1];
    }
    return $icon;
  }

  /**
   * Sanitize payment fields
   * - some gateways include js in their payment fields
   * @param WC_Payment_Gateway $gateway
   * @return mixed|string
   */
  protected function sanitize_payment_fields(WC_Payment_Gateway $gateway){
    $html = '';
    if( $gateway->has_fields() || $gateway->get_description() ){

      ob_start();
      $gateway->payment_fields();
      $html = ob_get_contents();
      ob_end_clean();

      // remove any javascript
      // note: DOMDocument causes more problems than it's worth

//      $doc = new DOMDocument();
//      $doc->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
//      $script_tags = $doc->getElementsByTagName('script');
//      $length = $script_tags->length;
//      for ($i = 0; $i < $length; $i++) {
//        $script_tags->item($i)->parentNode->removeChild($script_tags->item($i));
//      }
//      echo $doc->saveHTML();

      // simple preg_replace
      $html = preg_replace('/<script.+?<\/script>/im', '', $html);
    }
    return $html;
  }

}