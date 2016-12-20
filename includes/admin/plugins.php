<?php

/**
 * WP Plugin Updates
 *
 * @class    WC_POS_Admin_Plugins
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\Admin;

class Plugins {

  public function __construct() {
    add_filter( 'plugin_action_links_'. \WC_POS\PLUGIN_FILE, array ( $this, 'plugin_action_links' ) );
    add_action( 'in_plugin_update_message-' . \WC_POS\PLUGIN_FILE, array ( $this, 'plugin_update_message' ), 10, 2 );
  }

  /**
   * Prepend Settings link to plugin actions
   * @param $links
   * @return array
   */
  public function plugin_action_links( $links ){
    return array(
      'settings' => '<a href="'. admin_url( 'admin.php?page=wc_pos_settings' ) .'">'. /* translators: wordpress */ __( 'Settings' ) .'</a>'
    ) + $links;
  }

  /**
   * Thanks to: http://andidittrich.de/2015/05/howto-upgrade-notice-for-wordpress-plugins.html
   * @param $currentPluginMetadata
   * @param $newPluginMetadata
   */
  public function plugin_update_message( $currentPluginMetadata, $newPluginMetadata ){
    if (isset($newPluginMetadata->upgrade_notice) && strlen(trim($newPluginMetadata->upgrade_notice)) > 0){
      echo '<p style="background-color: #d54e21; padding: 10px; color: #f9f9f9; margin-top: 10px"><strong>'.  /* translators: wordpress */ __( 'Important:' ) . '</strong> ';
      echo esc_html($newPluginMetadata->upgrade_notice), '</p>';
    }
  }

}