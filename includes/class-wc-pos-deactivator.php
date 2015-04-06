<?php

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @class     WC_POS_Deactivator
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_Deactivator {

  /**
   * Fired when the plugin is deactivated.
   *
   * @param $network_wide
   */
  public static function deactivate( $network_wide ) {

    if ( function_exists( 'is_multisite' ) && is_multisite() ) {

      if ( $network_wide ) {

        // Get all blog ids
        $blog_ids = self::get_blog_ids();

        foreach ( $blog_ids as $blog_id ) {

          switch_to_blog( $blog_id );
          self::single_deactivate();

          restore_current_blog();

        }

      } else {
        self::single_deactivate();
      }

    } else {
      self::single_deactivate();
    }

  }

  /**
   * Get all blog ids of blogs in the current network that are:
   * - not archived
   * - not spam
   * - not deleted
   */
  private static function get_blog_ids() {

    global $wpdb;

    // get an array of blog ids
    $sql = "SELECT blog_id FROM $wpdb->blogs
      WHERE archived = '0' AND spam = '0'
      AND deleted = '0'";

    return $wpdb->get_col( $sql );

  }

  /**
   * Fired when the plugin is deactivated.
   */
  public static function single_deactivate() {
    // remove pos capabilities
    self::remove_pos_capability();

    // flush on activation and deactivation
    // this will remove the pos rewrite rule
    flush_rewrite_rules( false ); // false will not overwrite .htaccess
  }

  /**
   * remove default pos capabilities to administrator and
   * shop_manager roles
   */
  static private function remove_pos_capability(){
    $roles = array('administrator', 'shop_manager');
    $caps = array('manage_woocommerce_pos', 'access_woocommerce_pos');
    foreach($roles as $slug) :
      $role = get_role($slug);
      if($role) : foreach($caps as $cap) :
        $role->remove_cap($cap);
      endforeach; endif;
    endforeach;
  }

}
