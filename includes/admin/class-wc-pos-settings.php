<?php

/**
 * WP Settings Class
 *
 * @class    WC_POS_Admin_Settings
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings {

  /* @var string The db prefix for WP Options table */
  const DB_PREFIX = 'woocommerce_pos_settings_';

  /* @var string The settings screen id */
  private $screen_id;

  /* @var array An array of settings objects */
  private $settings = array();

  static public $handlers = array(
    'general'   => 'WC_POS_Admin_Settings_General',
    'checkout'  => 'WC_POS_Admin_Settings_Checkout',
    'hotkeys'   => 'WC_POS_Admin_Settings_HotKeys',
    'access'    => 'WC_POS_Admin_Settings_Access',
    'tools'     => 'WC_POS_Admin_Settings_Tools'
  );

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();
    add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    add_action( 'current_screen', array( $this, 'conditional_init' ) );
  }

  /**
   * Load settings page subclasses
   */
  private function init(){

  }

  /**
   * Add Settings page to admin menu
   */
  public function admin_menu() {
    $this->screen_id = add_submenu_page(
      WC_POS_PLUGIN_NAME,
      /* translators: woocommerce */
      __( 'Settings', 'woocommerce' ),
      /* translators: woocommerce */
      __( 'Settings', 'woocommerce' ),
      'manage_woocommerce_pos',
      'wc_pos_settings',
      array( $this, 'display_settings_page' )
    );
  }

  /**
   *
   *
   * @param $current_screen
   */
  public function conditional_init( $current_screen ) {
    if( $current_screen->id == $this->screen_id ) {

      // init handlers for settings pages
      $handlers = apply_filters( 'woocommerce_pos_settings_handlers', self::$handlers);
      foreach($handlers as $key => $handler){
        $this->settings[$key] = new $handler();
      }

      // Enqueue scripts for the settings page
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
      add_action( 'admin_print_footer_scripts', array( $this, 'admin_inline_js' ) );

      // allow third party to hook into settings page
      do_action( 'woocommerce_pos_settings_page' );

    }
  }

  /**
   * Output the settings pages
   */
  public function display_settings_page() {
    include 'views/settings.php';
  }

  /**
   * Delete settings in WP options table
   *
   * @param $id
   * @return bool
   */
  static function delete_settings($id){
    return delete_option(self::DB_PREFIX . $id);
  }

  /**
   * Delete all settings in WP options table
   */
  static function delete_all_settings(){
    global $wpdb;
    $wpdb->query(
      $wpdb->prepare("
        DELETE FROM {$wpdb->options}
        WHERE option_name
        LIKE '%s'",
        self::DB_PREFIX.'%'
      )
    );
  }

  /**
   * Settings styles
   */
  public function enqueue_admin_styles() {
    wp_enqueue_style(
      WC_POS_PLUGIN_NAME . '-admin',
      WC_POS_PLUGIN_URL . 'assets/css/admin.min.css',
      null,
      WC_POS_VERSION
    );

    wp_enqueue_style(
      WC_POS_PLUGIN_NAME . '-icons',
      WC_POS_PLUGIN_URL . 'assets/css/icons.min.css',
      null,
      WC_POS_VERSION
    );
  }

  /**
   * Settings scripts
   */
  public function enqueue_admin_scripts() {

    wp_enqueue_script( 'jquery-ui-sortable' );

    wp_enqueue_script(
      'backbone.radio',
      '//cdnjs.cloudflare.com/ajax/libs/backbone.radio/0.9.0/backbone.radio.min.js',
      array( 'jquery', 'backbone', 'underscore' ),
      false,
      true
    );

    wp_enqueue_script(
      'marionette',
      '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.0/backbone.marionette.min.js',
      array( 'jquery', 'backbone', 'underscore' ),
      false,
      true
    );

    wp_enqueue_script(
      'handlebars',
      '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.0/handlebars.min.js',
      array( 'jquery', 'backbone', 'underscore' ),
      false,
      true
    );

    wp_enqueue_script(
      'select2',
      '//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js',
      array( 'jquery' ),
      false,
      true
    );

    wp_enqueue_script(
      'moment',
      '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js',
      array( 'jquery' ),
      false,
      true
    );

    wp_enqueue_script(
      'accounting',
      '//cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js',
      array( 'jquery' ),
      false,
      true
    );

    wp_enqueue_script(
      'idb-wrapper',
      '//cdnjs.cloudflare.com/ajax/libs/idbwrapper/1.4.1/idbstore.min.js',
      array(),
      false,
      true
    );

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-admin-app',
      WC_POS_PLUGIN_URL . 'assets/js/admin.build.js',
      array('backbone', 'backbone.radio', 'marionette', 'handlebars', 'idb-wrapper', 'accounting', 'moment', 'select2'),
      WC_POS_VERSION,
      true
    );

    wp_enqueue_script(
      'eventsource-polyfill',
      WC_POS_PLUGIN_URL . 'assets/js/vendor/eventsource.min.js',
      array(),
      false,
      true
    );

    $locale_js = WC_POS_i18n::locale_js();
    if( $locale_js ) {
      wp_enqueue_script(
        WC_POS_PLUGIN_NAME . '-js-locale',
        $locale_js,
        array( WC_POS_PLUGIN_NAME . '-admin-app' ),
        WC_POS_VERSION,
        true
      );
    }
  }

  /**
   * Start the Settings App
   */
  public function admin_inline_js() {
    echo '<script type="text/javascript">POS.options = '. wc_pos_json_encode( WC_POS_Params::admin() ) .'; POS.start();</script>';
  }

}