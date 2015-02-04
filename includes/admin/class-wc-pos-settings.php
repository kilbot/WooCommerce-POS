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

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();
    add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    add_action( 'current_screen', array( $this, 'conditional_init' ) );
  }

  /**
   *
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

      // Load settings page subclasses
      $settings = apply_filters( 'woocommerce_pos_settings_tabs_array', array(
        new WC_POS_Admin_Settings_General(),
        new WC_POS_Admin_Settings_Checkout(),
        new WC_POS_Admin_Settings_Access(),
        new WC_POS_Admin_Settings_Tools()
      ));
      $this->settings = $settings;

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
   * Get settings data
   *
   * @param $id
   * @param mixed $key
   * @return array
   */
  static public function get_settings($id, $key = false) {

    // get settings
    $settings = get_option(self::DB_PREFIX . $id);

//		// default settings for gateways
//		if(!$settings) {
//			preg_replace('/^gateway_/', '', $id, 1, $count);
//			if($count) {
//				$settings = get_option(self::DB_PREFIX . $id);
//			}
//		}

    // return a single setting if $key given
    if($key) {
      $settings = array_key_exists($key, $settings) ? $settings[$key] : false;
    }

    return $settings;
  }

  /**
   * Save settings data
   *
   * @param bool $id
   * @param array $data
   * @return array
   */
  static public function save_settings($id = false, array $data) {

    // validate id
    if( !$id && isset( $data['id'] )){
      $id = $data['id'];
      unset($data['id']);
    }

    if(!$id){
      wp_die('There is no option id');
    }

    // check if settings has save action
    if( has_action('woocommerce_pos_settings_save_'.$id) ) {
      do_action('woocommerce_pos_settings_save_'.$id, $data);
      $saved = true;
    } else {
      $saved = self::update_option($id, $data);
    }

    if($saved){
      $response = array(
        'result' => 'success',
        /* translators: woocommerce */
        'notice' => __( 'Your settings have been saved.', 'woocommerce' )
      );
    } else {
      $response = array(
        'result' => 'error',
        /* translators: woocommerce */
        'notice' => __( 'Action failed. Please refresh the page and retry.', 'woocommerce' )
      );

    }

    $return['response'] = $response;
    return $return;
  }

  /**
   * Store the settings in the WP options table
   *
   * @param $id
   * @param $data
   * @return bool
   */
  static private function update_option($id, $data){

    // reserved option names
    if( isset( $data['response'] ) )
      wp_die('Data name "response" is reserved');

    // add timestamp to force update
    $data['updated'] = current_time( 'timestamp' );

    // remove the security attribute
    unset( $data['security'] );

    $updated = add_option( self::DB_PREFIX . $id, $data, '', 'no' );
    if(!$updated) {
      $updated = update_option( self::DB_PREFIX . $id, $data );
    }

    return $updated;
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
      'handlebars',
      '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js',
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
      '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js',
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
      false,
      false,
      true
    );

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-core',
      WC_POS_PLUGIN_URL . 'assets/js/core.build.js',
      array( 'jquery', 'backbone', 'underscore', 'accounting', 'idb-wrapper', 'moment', 'select2', 'handlebars' ),
      WC_POS_VERSION,
      true
    );

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-admin-app',
      WC_POS_PLUGIN_URL . 'assets/js/admin.build.js',
      array( WC_POS_PLUGIN_NAME . '-core' ),
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
        array( WC_POS_PLUGIN_NAME . '-core' ),
        WC_POS_VERSION,
        true
      );
    }
  }

  /**
   * Start the Settings App
   */
  public function admin_inline_js() {
    echo '<script type="text/javascript">POS.start('. json_encode( WC_POS_Params::admin() ) .');</script>';
  }

}