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

  public function __construct() {

    // wpmu_new_blog
    add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

    // check dependencies
    add_action( 'admin_init', array( $this, 'run_checks' ) );

  }

  /**
   * Fired when the plugin is activated.
   *
   * @param $network_wide
   */
  static public function activate( $network_wide ) {
    if ( function_exists( 'is_multisite' ) && is_multisite() ) {

      if ( $network_wide  ) {

        // Get all blog ids
        $blog_ids = self::get_blog_ids();

        foreach ( $blog_ids as $blog_id ) {

          switch_to_blog( $blog_id );
          self::single_activate();

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
    self::single_activate();
    restore_current_blog();

  }

  /**
   * Get all blog ids of blogs in the current network that are:
   * - not archived
   * - not spam
   * - not deleted
   */
  static private function get_blog_ids() {

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
  static public function single_activate() {

    // Add rewrite rules, $this->generate_rewrite_rules not called on activation
    global $wp_rewrite;
    $permalink = get_option( 'woocommerce_pos_settings_permalink' );
    $slug = $permalink && $permalink != '' ? $permalink : 'pos' ;
    add_rewrite_rule('^'. $slug .'/?$','index.php?pos=1','top');
    flush_rewrite_rules( false ); // false will not overwrite .htaccess

    // add pos capabilities
    self::add_pos_capability();

    // set the auto redirection on next page load
    set_transient( 'woocommere_pos_welcome', 1, 30 );
  }

  /**
   * add default pos capabilities to administrator and
   * shop_manager roles
   */
  static private function add_pos_capability(){
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
   * Check dependencies
   */
  public function run_checks() {
    if ( defined( 'DOING_AJAX' ) && DOING_AJAX )
      return;

    if( ! current_user_can( 'activate_plugins' ) )
      return;

    $this->version_check();
    $this->woocommerce_check();
  }

  /**
   * Check version number, runs every admin page load
   */
  private function version_check(){
    // next check the POS version number
    $old = get_option( 'woocommerce_pos_db_version' );
    if( !$old || version_compare( $old, WC_POS_VERSION, '<' ) ) {
      $this->db_upgrade( $old, WC_POS_VERSION );
      update_option( 'woocommerce_pos_db_version', WC_POS_VERSION );
    }
  }

  /**
   * Upgrade database
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
   * WooCommerce POS will not load if WooCommerce is not present
   */
  private function woocommerce_check() {
    if( ! class_exists( 'WooCommerce' ) )
      add_action( 'admin_notices', array( $this, 'woocommerce_alert' ) );
  }

  /**
   * Admin message - WooCommerce not activated
   */
  public function woocommerce_alert(){
    echo '<div class="error">
      <p>'. sprintf( __('<strong>WooCommerce POS</strong> requires <a href="%s">WooCommerce</a>. Please <a href="%s">install and activate WooCommerce</a>', 'woocommerce-pos' ), 'http://wordpress.org/plugins/woocommerce/', admin_url('plugins.php') ) . ' &raquo;</p>
      </div>';
  }

}

// self loading
new WC_POS_Activator();