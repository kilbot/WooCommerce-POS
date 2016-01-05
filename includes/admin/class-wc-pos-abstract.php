<?php

/**
 * Abstract Admin Page Class
 *
 * @class    WC_POS_Admin_Abstract
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Abstract {

  /* @var string The db prefix for WP Options table */
  const DB_PREFIX = 'woocommerce_pos_settings_';

  /* @var string The settings screen id */
  protected $screen_id;

  /* @var string JS var with page id, used for API requests */
  protected $wc_pos_adminpage = '';

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    add_action( 'current_screen', array( $this, 'conditional_init' ) );
  }

  /**
   *
   *
   * @param $current_screen
   */
  public function conditional_init( $current_screen ) {
    if ( $current_screen->id == $this->screen_id ) {

      // Enqueue scripts for the admin pages
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ), 99 );
      add_action( 'admin_print_scripts', array( $this, 'admin_print_scripts' ) );
      add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ), 99 );
      add_action( 'admin_print_footer_scripts', array( $this, 'print_footer_scripts' ), 99 );
    }
  }

  /**
   *
   */
  public function admin_menu(){}
  public function enqueue_admin_scripts(){}

  /**
   * Admin styles
   * note single stylesheet for all settings and system status
   */
  public function enqueue_admin_styles() {
    wp_enqueue_style(
      WC_POS_PLUGIN_NAME . '-admin',
      WC_POS_PLUGIN_URL . 'assets/css/admin.min.css',
      null,
      WC_POS_VERSION
    );
  }

  /**
   *
   */
  public function admin_print_scripts(){
    echo '<script>var wc_pos_admin = "' . $this->wc_pos_adminpage . '";</script>';
  }

  /**
   * Start the Admin App
   */
  public function print_footer_scripts() {
    $options = array( 'wc_api'  => get_woocommerce_api_url(null) );
    echo '<script>POS.start(' . json_encode( $options ) . ');</script>';
  }

  /**
   * @return int
   */
  static public function get_db_version(){
    return get_option( self::DB_PREFIX . 'db_version', 0 );
  }

  /**
   * updates db to new version number
   * bumps the idb version number
   */
  static public function bump_versions(){
    self::update_option( self::DB_PREFIX . 'db_version', WC_POS_VERSION );
    self::bump_idb_version();
  }

  /*
   *
   */
  static public function get_idb_version(){
    $version = (int) get_option( self::DB_PREFIX . 'idb_version', 0 );
    return $version ? $version : self::bump_idb_version();
  }

  /*
   *
   */
  static public function bump_idb_version(){
    $version = (int) get_option( self::DB_PREFIX . 'idb_version', 0 ) + 1;
    if( self::update_option( self::DB_PREFIX . 'idb_version', $version ) ){
      return $version;
    }
  }

  /**
   * @param $id
   * @param $key
   * @return bool
   */
  static public function get_option( $id, $key = false ){
    $handlers = (array) WC_POS_Admin_Settings::handlers();
    if( !array_key_exists( $id, $handlers ) )
      return false;

    $settings = $handlers[$id]::get_instance();
    return $settings->get( $key );
  }

  /**
   * Add or update a WordPress option.
   * The option will _not_ auto-load by default.
   *
   * @param string $name
   * @param mixed $value
   * @param string $autoload
   * @return bool
   */
  static public function update_option( $name, $value, $autoload = 'no' ) {
    $success = add_option( $name, $value, '', $autoload );
    return $success ? $success : update_option( $name, $value );
  }

}