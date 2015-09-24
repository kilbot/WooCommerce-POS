<?php
/**
 *
 *
 * @class    WC_POS_Settings
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Settings {

  /* @var string The db prefix for WP Options table */
  const DB_PREFIX = 'woocommerce_pos_';

  /* @var WC_POS_Params instance */
  private $params;

  /* @var array */
  private $settings;

  /**
   * @var array settings handlers
   */
  static public $handlers = array(
    'general'   => 'WC_POS_Admin_Settings_General',
    'checkout'  => 'WC_POS_Admin_Settings_Checkout',
    'hotkeys'   => 'WC_POS_Admin_Settings_HotKeys',
    'access'    => 'WC_POS_Admin_Settings_Access',
    'tools'     => 'WC_POS_Admin_Settings_Tools',
    'status'    => 'WC_POS_Admin_Settings_Status'
  );

  /**
   *
   */
  public function __construct() {
    add_action( 'wp_ajax_wc_pos_admin_settings_payload', array( $this, 'payload') );
    add_action( 'wp_ajax_wc_pos_admin_settings', array( $this, 'admin_settings') );
  }

  /**
   * Returns array of settings classes
   * @return mixed|void
   */
  static public function handlers(){
    return apply_filters( 'woocommerce_pos_settings_handlers', self::$handlers);
  }

  /**
   * AJAX payload
   */
  public function payload(){
    WC_POS_Server::check_ajax_referer();

    $this->params = new WC_POS_Params();

    $payload = array(
      'templates' => $this->templates_payload(),
      'settings'  => $this->settings,
      'params'    => $this->params->payload(),
      'i18n'      => WC_POS_i18n::payload()
    );

    WC_POS_Server::response( $payload );
  }

  /**
   * Templates payload
   * @return array
   */
  public function templates_payload(){
    $templates = array();
    foreach(self::handlers() as $key => $handler){
      $settings = $handler::get_instance();
      ob_start();
      $settings->output();
      $template = ob_get_clean();
      $templates[ $key ] = preg_replace('/^\s+|\n|\r|\s+$/m', '', $template);
      $this->settings[] = array(
        'id'    => $settings->id,
        'label' => $settings->label,
        'data'  => $settings->get()
      );
    }
    return apply_filters( 'woocommerce_pos_admin_settings_templates', $templates );
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
    $handlers = (array) self::handlers();
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

  /**
   * POS Settings stored in options table
   */
  public function admin_settings() {
    WC_POS_Server::check_ajax_referer();
    $result = $this->process_admin_settings();
    WC_POS_Server::response($result);
  }

  /**
   * @return array|bool|mixed|void|WP_Error
   */
  private function process_admin_settings(){
    // validate
    if(!isset($_GET['id']))
      return new WP_Error(
        'woocommerce_pos_settings_error',
        __( 'There is no settings id', 'woocommerce-pos' ),
        array( 'status' => 400 )
      );

    $id   = $_GET['id'];
    $data = WC_POS_Server::get_raw_data();

    // special case: gateway_
    $gateway_id = preg_replace( '/^gateway_/', '', strtolower( $id ), 1, $count );
    if($count){
      $handler = new WC_POS_Admin_Settings_Gateways($gateway_id);

      // else, find handler by id
    } else {
      $handlers = (array) self::handlers();
      if(!isset($handlers[$id]))
        return new WP_Error(
          'woocommerce_pos_settings_error',
          sprintf( __( 'No handler found for %s settings', 'woocommerce-pos' ), $_GET['id']),
          array( 'status' => 400 )
        );
      $handler = new $handlers[$id]();
    }

    // Compatibility for clients that can't use PUT/PATCH/DELETE
    $method = strtoupper($_SERVER['REQUEST_METHOD']);
    if ( isset( $_GET['_method'] ) ) {
      $method = strtoupper( $_GET['_method'] );
    } elseif ( isset( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) ) {
      $method = strtoupper( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] );
    }

    // get
    if( $method === 'GET' ) {
      return $handler->get();
    }

    // set
    if( $method === 'POST' || $method === 'PUT' ) {
      return $handler->set($data);
    }

    // delete
    if( $method === 'DELETE' ) {
      return $handler->delete($data);
    }

    return new WP_Error(
      'woocommerce_pos_cannot_'.$method.'_'.$id,
      __( 'Settings error', 'woocommerce-pos' ),
      array( 'status' => 405 )
    );
  }

}