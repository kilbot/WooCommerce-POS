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
      foreach(self::handlers() as $key => $handler){
        $this->settings[$key] = $handler::get_instance();
      }

      // Enqueue scripts for the settings page
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ), 99 );
      add_action( 'admin_print_footer_scripts', array( $this, 'admin_inline_js' ) );

    }
  }

  /**
   * Returns array of settings classes
   * @return mixed|void
   */
  static public function handlers(){
    return apply_filters( 'woocommerce_pos_settings_handlers', self::$handlers);
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
      WC_POS_PLUGIN_URL . 'assets/css/admin-icons.min.css',
      null,
      WC_POS_VERSION
    );
  }

  /**
   * Settings scripts
   */
  public function enqueue_admin_scripts() {

    // deregister scripts
    wp_deregister_script( 'underscore' );
    wp_deregister_script( 'select2' );

    // register
    $external_libs = WC_POS_Template::get_external_js_libraries();
    wp_register_script( 'underscore',     $external_libs['lodash'],     array( 'jquery' ), null, true );
    wp_register_script( 'backbone.radio', $external_libs['radio'],      array( 'jquery', 'backbone', 'underscore' ), null, true );
    wp_register_script( 'marionette',     $external_libs['marionette'], array( 'jquery', 'backbone', 'underscore' ), null, true );
    wp_register_script( 'handlebars',     $external_libs['handlebars'], false, null, true );
    wp_register_script( 'moment',         $external_libs['moment'],     false, null, true );
    wp_register_script( 'accounting',     $external_libs['accounting'], false, null, true );
    wp_register_script( 'select2',        $external_libs['select2'],    array( 'jquery' ), null, true );

    // enqueue
    wp_enqueue_script( 'jquery-ui-sortable' );

    $build = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'build' : 'min';

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-admin-app',
      WC_POS_PLUGIN_URL . 'assets/js/admin.'. $build .'.js',
      array('backbone', 'backbone.radio', 'marionette', 'handlebars', 'accounting', 'moment', 'select2'),
      WC_POS_VERSION,
      true
    );

    wp_enqueue_script(
      'eventsource-polyfill',
      WC_POS_PLUGIN_URL . 'assets/js/vendor/eventsource.min.js',
      array(),
      null,
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
    $params = new WC_POS_Params();
    echo '<script type="text/javascript">POS.options = '. json_encode( $params->payload() ) .'; POS.start();</script>';
  }

}