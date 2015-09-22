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

  /** @var POS url slug */
  private $slug;

  /** @var regex match for rewite_rule  */
  private $regex;

  /** @var WC_POS_Params instance */
  public $params;

  /** @var array external libraries */
  static public $external_libs = array(
    'min' => array(
      'jquery'       => 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
      'lodash'       => 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js',
      'backbone'     => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min.js',
      'radio'        => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.2/backbone.radio.min.js',
      'marionette'   => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.3/backbone.marionette.min.js',
      'handlebars'   => 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.1/handlebars.min.js',
      'select2'      => 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js',
      'moment'       => 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js',
      'accounting'   => 'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js',
      'jquery.color' => 'https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js',
    ),
    'debug' => array(
      'jquery'       => 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.js',
      'lodash'       => 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js',
      'backbone'     => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone.js',
      'radio'        => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.2/backbone.radio.js',
      'marionette'   => 'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.3/backbone.marionette.js',
      'handlebars'   => 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.1/handlebars.js',
      'select2'      => 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.js',
      'moment'       => 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.js',
      'accounting'   => 'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.js',
      'jquery.color' => 'https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.js',
    )
  );

  /**
   * Constructor
   */
  public function __construct() {
    $this->slug = WC_POS_Admin_Permalink::get_slug();
    $this->regex = '^'. $this->slug .'/?$';

    add_rewrite_tag( '%pos%', '([^&]+)' );
    add_rewrite_rule( $this->regex, 'index.php?pos=1', 'top' );
    add_filter( 'option_rewrite_rules', array( $this, 'rewrite_rules' ), 1 );
    add_action( 'template_redirect', array( $this, 'template_redirect' ), 1 );
  }

  /**
   * Make sure cache contains POS rewrite rule
   * @param $rules
   * @return bool
   */
  public function rewrite_rules( $rules ){
    return isset( $rules[$this->regex] ) ? $rules : false;
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

    // add head & footer actions
    add_action( 'woocommerce_pos_head', array( $this, 'head' ) );
    add_action( 'woocommerce_pos_footer', array( $this, 'footer' ) );

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
   * @return array
   */
  static public function get_external_js_libraries(){
    return defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? self::$external_libs['debug'] : self::$external_libs['min'] ;
  }

  /**
   * Output the head scripts
   */
  public function head() {

    // enqueue and print javascript
    $styles = apply_filters( 'woocommerce_pos_enqueue_head_css', array(
      'pos-css'   => WC_POS_PLUGIN_URL .'assets/css/pos.min.css?ver='. WC_POS_VERSION,
      'icons-css' => WC_POS_PLUGIN_URL .'assets/css/icons.min.css?ver='. WC_POS_VERSION
    ) );

    foreach( $styles as $style ) {
      echo $this->format_css( trim( $style ) ) . "\n";
    }

    // enqueue and print javascript
    $js = array(
      'modernizr' => WC_POS_PLUGIN_URL .'assets/js/vendor/modernizr.custom.min.js?ver='. WC_POS_VERSION,
    );

    $scripts = apply_filters( 'woocommerce_pos_enqueue_head_js', $js );
    foreach( $scripts as $script ) {
      echo $this->format_js( trim( $script ) ) . "\n";
    }
  }

  /**
   * Output the footer scripts
   */
  public function footer() {
    $build = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? 'build' : 'min';

    $js = self::get_external_js_libraries();
    $js['app'] = WC_POS_PLUGIN_URL . 'assets/js/app.'. $build .'.js?ver=' . WC_POS_VERSION;
    $scripts = apply_filters( 'woocommerce_pos_enqueue_footer_js', $js );

    foreach( $scripts as $script ) {
      echo $this->format_js( trim( $script ) ) . "\n";
    }
  }

  /**
   * Makes sure css is in the right format for template
   * @param $style
   * @return string
   */
  private function format_css( $style ){
    if( substr( $style, 0, 5 ) === '<link' )
      return $style;

    if( substr( $style, 0, 4 ) === 'http' )
      return '<link rel="stylesheet" href="' . $style . '" type="text/css" />';

    return '<style>' . $style . '</style>';
  }

  /**
   * Makes sure javascript is in the right format for template
   * @param $script
   * @return string
   */
  private function format_js( $script ){
    if( substr( $script, 0, 7 ) === '<script' )
      return $script;

    if( substr( $script, 0, 4 ) === 'http' )
      return '<script src="' . $script . '"></script>';

    return '<script>' . $script . '</script>';
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

      // remove script tags
      $html = $this->removeDomNodes( $html, '//script' );
    }
    return self::trim_html_string( $html );;
  }

  /**
   * Removes dom nodes, eg: <script> elements
   * @param $html
   * @param $xpathString
   * @return string
   */
  private function removeDomNodes($html, $xpathString){
    $dom = new DOMDocument;

    // Libxml constants not available on all servers (Libxml < 2.7.8)
    // $html->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $dom->loadHtml( '<div class="form-group">' . $html . '</div>' );
    # remove <!DOCTYPE
    $dom->removeChild($dom->doctype);
    # remove <html><body></body></html>
    $dom->replaceChild($dom->firstChild->firstChild->firstChild, $dom->firstChild);

    // remove the required node
    $xpath = new DOMXPath($dom);
    while ($node = $xpath->query($xpathString)->item(0)) {
      $node->parentNode->removeChild($node);
    }

    return $dom->saveHTML();
  }

  /**
   * Returns an assoc array of all default tmpl-*.php paths
   * - uses SPL iterators
   * @param $partials_dir
   * @return array
   */
  static public function locate_default_template_files( $partials_dir = '' ){
    if( empty( $partials_dir ) )
      $partials_dir = self::get_template_dir();

    $iterator = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator( $partials_dir ),
      RecursiveIteratorIterator::SELF_FIRST
    );

    $regex = new RegexIterator(
      $iterator, '/^.+tmpl-[a-z-]+\.php$/i',
      RecursiveRegexIterator::GET_MATCH
    );

    $paths = array_keys( iterator_to_array( $regex ) );
    $templates = array();

    foreach( $paths as $path ){
      $slug = str_replace( array( $partials_dir, '.php' ), '', $path );
      $templates[ $slug ] = $path;
    };

    return $templates;
  }

  /**
   * Returns an array of template paths
   * @param $partials_dir
   * @return array
   */
  static public function locate_template_files( $partials_dir = '' ){
    $files = array();
    foreach( self::locate_default_template_files( $partials_dir ) as $slug => $path ){
      $files[ $slug ] = self::locate_template_file( $path );
    };
    return $files;
  }

  /**
   * Locate a single template partial
   * @param string $default_path
   * @return string
   */
  static public function locate_template_file( $default_path = '' ){
    $custom_path1 = str_replace( self::get_template_dir(), 'woocommerce-pos', $default_path );
    $custom_path2 = str_replace( 'tmpl-', '', $custom_path1 );
    $custom = locate_template( array( $custom_path1, $custom_path2 ) );
    return $custom ? $custom : $default_path;
  }

  /**
   * Returns the partials directory
   * @return string
   */
  static public function get_template_dir(){
    return realpath( WC_POS_PLUGIN_PATH . 'includes/views' );
  }

  /**
   * @param $partials_dir
   * @return array
   */
  static public function create_templates_array( $partials_dir = '' ){
    $templates = array();

    foreach( self::locate_template_files( $partials_dir ) as $slug => $file ){
      $keys = explode( substr( $slug, 0, 1 ), substr( $slug, 1 ) );
      $template = array_reduce( array_reverse( $keys ), function($result, $key){
        return array( $key => $result );
      }, self::template_output( $file ) );
      $templates = array_merge_recursive( $templates, $template );
    }

    return $templates;
  }

  /**
   * Output template partial as string
   * @param $file
   * @return string
   */
  static public function template_output( $file ){
    ob_start();
    include $file;
    $template = ob_get_clean();
    return self::trim_html_string( $template );
  }

  /**
   * Remove newlines and code spacing
   * @param $str
   * @return mixed
   */
  static private function trim_html_string( $str ){
    return preg_replace('/^\s+|\n|\r|\s+$/m', '', $str);
  }

  /**
   * @return array
   */
  private function gateways_templates(){
    $settings = WC_POS_Admin_Settings_Checkout::get_instance();
    $gateways = $settings->load_enabled_gateways();
    $templates = array();
    $this->params = new WC_POS_Params();

    if($gateways): foreach( $gateways as $gateway ):
      $this->params->gateways[] = array(
        'method_id'    => $gateway->id,
        'method_title' => esc_html( $gateway->get_title() ),
        'icon'         => $this->sanitize_icon( $gateway ),
        'active'       => $gateway->default
      );
      $templates[$gateway->id] = $this->sanitize_payment_fields( $gateway );
    endforeach; endif;

    return $templates;
  }

  /**
   * @return mixed|void
   */
  public function payload(){
    $templates = self::create_templates_array();
    $templates['pos']['checkout']['gateways'] = $this->gateways_templates();
    return apply_filters( 'woocommerce_pos_templates', $templates );
  }

  /**
   * @return string
   */
//  private function get_template_js(){
//    $path = 'assets/js/templates.js';
//
//    // create templates file
//    // todo: no caching at the moment
//    $this->create_templates_file( WC_POS_PLUGIN_PATH . $path );
//
//    // template url
//    return WC_POS_PLUGIN_URL . $path . '?ver=' . WC_POS_VERSION;
//  }

  /**
   * Creates a js file of template partials
   * @param $output_file
   * @return int
   */
//  public function create_templates_file( $output_file ){
//    $templates = self::create_templates_array();
//    $templates['pos']['checkout']['gateways'] = $this->gateways_templates();
//    $templates = apply_filters( 'woocommerce_pos_templates', $templates );
//    return file_put_contents( $output_file, 'Handlebars.Templates = ' . json_encode($templates) );
//  }

}