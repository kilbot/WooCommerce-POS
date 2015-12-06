<?php

/**
 * Activation checks and set up
 *
 * @class     WC_POS_Activator
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_Activator {

  // minimum requirements
  const WC_MIN_VERSION = '2.3.7';
  const PHP_MIN_VERSION = '5.4';

  /**
   * @param $file
   */
  public function __construct( $file ) {
    register_activation_hook( $file, array( $this, 'activate' ) );
    add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

    add_action( 'plugins_loaded', array( $this, 'run_woocommerce_pos' ) );
    $this->init();
  }

  /**
   * init subclasses
   * - WC_POS_Admin_Notices required in cases where WooCommerce POS fails to run
   */
  private function init(){
    if( is_admin() && (!defined('DOING_AJAX') || !DOING_AJAX) ){
      require_once WC_POS_PLUGIN_PATH . 'includes/admin/class-wc-pos-notices.php';
      new WC_POS_Admin_Notices();
    }
  }

  /**
   * Checks for valid install and begins execution of the plugin.
   */
  public function run_woocommerce_pos(){
    // Check for min requirements to run
    if( $this->php_check() && $this->woocommerce_check() ){
      require_once WC_POS_PLUGIN_PATH . 'includes/class-wc-pos.php';
      new WC_POS();

      // check permalinks
      if( is_admin() && (!defined('DOING_AJAX') || !DOING_AJAX) ){
        $this->permalink_check();
      }

      // Run update script if required
      $this->version_check();
    }
  }

  /**
   * Fired when the plugin is activated.
   *
   * @param $network_wide
   */
  public function activate( $network_wide ) {
    if ( function_exists( 'is_multisite' ) && is_multisite() ) {

      if ( $network_wide  ) {

        // Get all blog ids
        $blog_ids = $this->get_blog_ids();

        foreach ( $blog_ids as $blog_id ) {

          switch_to_blog( $blog_id );
          $this->single_activate();

          restore_current_blog();
        }

      } else {
        self::single_activate();
      }

    } else {
      self::single_activate();
    }
  }

  /**
   * Fired when a new site is activated with a WPMU environment.
   *
   * @param $blog_id
   */
  public function activate_new_site( $blog_id ) {

    if ( 1 !== did_action( 'wpmu_new_blog' ) ) {
      return;
    }

    switch_to_blog( $blog_id );
    $this->single_activate();
    restore_current_blog();

  }

  /**
   * Get all blog ids of blogs in the current network that are:
   * - not archived
   * - not spam
   * - not deleted
   */
  private function get_blog_ids() {

    global $wpdb;

    // get an array of blog ids
    $sql = "SELECT blog_id FROM $wpdb->blogs
      WHERE archived = '0' AND spam = '0'
      AND deleted = '0'";

    return $wpdb->get_col( $sql );

  }

  /**
   * Fired when the plugin is activated.
   */
  public function single_activate() {
    // add pos capabilities
    $this->add_pos_capability();

    // set the auto redirection on next page load
    //set_transient( 'woocommere_pos_welcome', 1, 30 );
  }

  /**
   * add default pos capabilities to administrator and
   * shop_manager roles
   */
  private function add_pos_capability(){
    $roles = array('administrator', 'shop_manager');
    $caps = array('manage_woocommerce_pos', 'access_woocommerce_pos');
    foreach($roles as $slug) :
      $role = get_role($slug);
      if($role) : foreach($caps as $cap) :
        $role->add_cap($cap);
      endforeach; endif;
    endforeach;
  }

  /**
   * Check version number, runs every admin page load
   */
  private function version_check(){
    $old = WC_POS_AJAX_Settings::get_db_version();
    if( version_compare( $old, WC_POS_VERSION, '<' ) ){
      WC_POS_AJAX_Settings::bump_versions();
      $this->db_upgrade( $old, WC_POS_VERSION );
    }
  }

  /**
   * Upgrade database
   * @param $old
   * @param $current
   */
  private function db_upgrade( $old, $current ) {
    $db_updates = array(
      '0.4' => 'updates/update-0.4.php'
    );
    foreach ( $db_updates as $version => $updater ) {
      if ( version_compare( $version, $old, '>' ) &&
        version_compare( $version, $current, '<=' ) ) {
        include( $updater );
      }
    }
  }

  /**
   * Check min version of WooCommerce installed
   */
  private function woocommerce_check() {
    if( class_exists( 'WooCommerce' ) && version_compare( WC()->version, self::WC_MIN_VERSION, '>=' ) )
      return true;

    if( class_exists( 'WC_POS_Admin_Notices' ) ){
      $message = sprintf(
        __('<strong>WooCommerce POS</strong> requires <a href="%s">WooCommerce %s or higher</a>. Please <a href="%s">install and activate WooCommerce</a>', 'woocommerce-pos' ),
        'http://wordpress.org/plugins/woocommerce/',
        self::WC_MIN_VERSION,
        admin_url('plugins.php')
      ) . ' &raquo;';
      WC_POS_Admin_Notices::add( $message );
    }
  }

  /**
   * Check min version of PHP
   */
  private function php_check(){
    $php_version = phpversion();
    if( version_compare( $php_version, self::PHP_MIN_VERSION, '>' ) )
      return true;

    if( class_exists( 'WC_POS_Admin_Notices' ) ) {
      $message = sprintf(
        __('<strong>WooCommerce POS</strong> requires PHP %s or higher. Read more information about <a href="%s">how you can update</a>', 'woocommerce-pos' ),
        self::PHP_MIN_VERSION,
        'http://www.wpupdatephp.com/update/'
      ) . ' &raquo;';
      WC_POS_Admin_Notices::add( $message );
    }
  }

  /**
   * POS Frontend will give 404 if pretty permalinks not active
   * - requires autoloader, ie: WC_POS()
   */
  private function permalink_check(){
    $fail = WC_POS_Status::permalinks_disabled();
    if( $fail ){
      $message = $fail['message'] . '. ';
      $message .= sprintf( '<a href="%s">%s</a>', $fail['buttons'][0]['href'], $fail['buttons'][0]['prompt'] ) . ' &raquo;';
      WC_POS_Admin_Notices::add( $message );
    }
  }

}