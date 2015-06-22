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
  static public $screen_id;

  /* @var array An array of settings objects */
  private $settings = array();

  static public $handlers = array(
    'general'   => 'WC_POS_Admin_Settings_General',
    'checkout'  => 'WC_POS_Admin_Settings_Checkout',
    'hotkeys'   => 'WC_POS_Admin_Settings_HotKeys',
    'access'    => 'WC_POS_Admin_Settings_Access',
    'tools'     => 'WC_POS_Admin_Settings_Tools',
    'status'    => 'WC_POS_Admin_Settings_Status'
  );

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    add_action( 'current_screen', array( $this, 'conditional_init' ) );
  }

  /**
   * Add Settings page to admin menu
   */
  public function admin_menu() {
    self::$screen_id = add_submenu_page(
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
    if( $current_screen->id == self::$screen_id ) {

      // init handlers for settings pages
      $handlers = apply_filters( 'woocommerce_pos_settings_handlers', self::$handlers);
      foreach($handlers as $key => $handler){
        $this->settings[$key] = new $handler();
      }

      // Enqueue scripts for the settings page
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
      add_action( 'admin_print_footer_scripts', array( $this, 'admin_inline_js' ) );

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

    //
    $build = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'build' : 'min';

    wp_enqueue_script( 'jquery-ui-sortable' );

    wp_enqueue_script(
      'backbone.radio',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.0/backbone.radio.min.js',
      array( 'jquery', 'backbone', 'underscore' ),
      false,
      true
    );

    wp_enqueue_script(
      'marionette',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.2/backbone.marionette.min.js',
      array( 'jquery', 'backbone', 'underscore' ),
      false,
      true
    );

    wp_enqueue_script(
      'handlebars',
      'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.2/handlebars.min.js',
      array( 'jquery', 'backbone', 'underscore' ),
      false,
      true
    );

    wp_enqueue_script(
      'select2',
      'https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js',
      array( 'jquery' ),
      false,
      true
    );

    wp_enqueue_script(
      'moment',
      'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.2/moment.min.js',
      array( 'jquery' ),
      false,
      true
    );

    wp_enqueue_script(
      'accounting',
      'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js',
      array( 'jquery' ),
      false,
      true
    );

    wp_enqueue_script(
      'idb-wrapper',
      'https://cdnjs.cloudflare.com/ajax/libs/idbwrapper/1.5.0/idbstore.min.js',
      array(),
      false,
      true
    );

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-admin-app',
      WC_POS_PLUGIN_URL . 'assets/js/admin.'. $build .'.js',
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

    $scripts = apply_filters( 'woocommerce_pos_admin_enqueue_scripts', array() );
    if( isset( $scripts['locale'] ) ) {
      wp_enqueue_script(
        WC_POS_PLUGIN_NAME . '-js-locale',
        $scripts['locale'],
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
    $params = apply_filters( 'woocommerce_pos_admin_params', array() );
    echo '<script type="text/javascript">POS.options = '. wc_pos_json_encode( $params ) .'; POS.start();</script>';
  }

}