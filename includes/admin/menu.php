<?php

/**
 * WP Admin Menu Class
 *
 * @class    WC_POS_Admin_Menu
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\Admin;

class Menu {

  /** @vars string Unique menu identifier */
  private $toplevel_screen_id;

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    add_filter( 'menu_order', array( $this, 'menu_order' ), 9, 1 );
  }

  /**
   * Add POS to admin menu
   */
  public function admin_menu() {
    if(!current_user_can('manage_woocommerce_pos')){
      return;
    }

    $this->toplevel_screen_id = add_menu_page(
      __( 'POS', 'woocommerce-pos' ),
      __( 'POS', 'woocommerce-pos' ),
      'manage_woocommerce_pos',
      \WC_POS\PLUGIN_NAME,
      array( $this, 'display_upgrade_page' ),
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjEyMDAiIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiPjxwYXRoIGZpbGw9IiM5OTkiIGQ9Ik0xMTE0LjI4NiAwSDg1LjdDMzguMzc1IDAgMCAzOC40IDAgODUuNzE0VjIxNC4xNGMwIDQ3LjMgMzguNCA4NS43IDg1LjcgODUuNyA0Ny4zNCAwIDg1LjcxNC0zOC4zNzUgODUuNzE0LTg1LjcxM1Y2MGgxNzEuNDN2MTU0LjE0YzAgNDcuMyAzOC40IDg1LjcgODUuNyA4NS43IDQ3LjMzOCAwIDg1LjcxMy0zOC4zNzUgODUuNzEzLTg1LjcxM1Y2MGgxNzEuNDI4djE1NC4xNGMwIDQ3LjMgMzguNCA4NS43IDg1LjcgODUuNyA0Ny4zNCAwIDg1LjcxNC0zOC4zNzUgODUuNzE0LTg1LjcxM1Y2MGgxNzEuNDI4djE1NC4xNGMwIDQ3LjMgMzguNCA4NS43IDg1LjcgODUuNyA0Ny4zNCAwIDg1LjcxNC0zOC4zNzQgODUuNzE0LTg1LjcxM1Y4NS43MTRDMTIwMCAzOC40IDExNjEuNiAwIDExMTQuMyAwek0yNzUuODkzIDUzMS43NzdjLTUyLjI5IDAtOTIuNjEgNDAuOTUtOTIuNjEgOTMuMjRzNDAuMzIgOTMuMiA5Mi42IDkzLjI0YzUyLjI5IDAgOTMuMjQtNDAuOTUgOTMuMjQtOTMuMjQuMDEtNTIuMzE3LTQwLjkyMy05My4yMTctOTMuMjIzLTkzLjI0eiIvPjxwYXRoIGZpbGw9IiM5OTkiIGQ9Ik0xMTE0LjI4NiAzMzkuODU1Yy0zMi4xMDQgMC02Mi4zNjgtMTEuOTUtODUuNzE1LTMzLjc1LTIzLjM0NyAyMS43OTgtNTMuNjEgMzMuNzUtODUuNzEzIDMzLjctMzIuMTA0IDAtNjIuMzY4LTExLjk1LTg1LjcxNS0zMy43NDgtMjMuMzQ4IDIxLjc5Ny01My42MTIgMzMuNzUtODUuNzE1IDMzLjc1cy02Mi4zNjctMTEuOTUyLTg1LjcxNS0zMy43NWMtMjMuMzQ3IDIxLjc5Ny01My42MSAzMy43NS04NS43MTQgMzMuNzUtMzIuMTAyIDAtNjIuMzY3LTExLjk1My04NS43MTQtMzMuNzUtMjMuMzQ3IDIxLjc5Ny01My42MTMgMzMuNzUtODUuNzE0IDMzLjc1LTMyLjEwMiAwLTYyLjM2Ny0xMS45NTMtODUuNzE0LTMzLjc1LTIzLjM0OCAyMS43OTctNTMuNjEyIDMzLjc1LTg1LjcxNCAzMy43NXMtNjIuMzY3LTExLjk1My04NS43MTQtMzMuNzVjLTIzLjM0NyAyMS43OTctNTMuNjEzIDMzLjc1LTg1LjcxNCAzMy43LTMyLjEwNCAwLTYyLjM2Ni0xMS45Ni04NS43MTQtMzMuNzZWMTIwMGwzNDMtMjM4LjY3aDc3MS4xODhjNDcuMzkzIDAgODUuODEyLTM4LjQyIDg1LjgxMi04NS44MTJWMzA2LjA5NGMtMjMuMzQ4IDIxLjgwNi01My42IDMzLjgwNi04NS43IDMzLjc2ek0yNzUuODkzIDc4Ni45M2MtMzUuMjggMC02Ny40MS0xMS4zNC05My4yNC0zMC4yNHYxMTUuMjljMCAyNC41Ny0xNS43NSAzOS4wNjItMzQuNjUgMzkuMDYyLTIxLjQyIDAtMzQuNjUtMTYuMzgtMzQuNjUtMzkuMDZWNTAzLjQyNmMwLTIyLjA1IDE1LjEyLTM4LjQzIDM0LjY1LTM4LjQzIDE0LjQ5IDAgMjcuMSA2LjkgMzEuNSAyOS42MSAyNS44My0xOS41MyA1OS4yMi0zMi4xMyA5Ni4zOS0zMi4xMyA5MC4wOSAwIDE2My4yIDcyLjUgMTYzLjIgMTYyLjVDNDM5LjA2MyA3MTQuNSAzNjYgNzg2LjkgMjc1LjkgNzg2Ljkzem0zODUuNTUuNjNjLTkwLjcyMiAwLTE2My4xNzItNzIuNDUtMTYzLjE3Mi0xNjMuMTcgMC04OS40NjIgNzIuNDUtMTYxLjkxMyAxNjMuMTczLTE2MS45MTMgODkuNDYgMCAxNjEuOSA3Mi41IDE2MS45IDE2MS45MTIuMDEgOTAuNzEtNzIuNDQzIDE2My4yMS0xNjEuOTQzIDE2My4yMXptMzIxLjkyNyAwYy01OS44NTIgMC0xMDIuMDYyLTMxLjUtMTAyLjA2Mi02MyAwLTE2LjM4IDEyLjYwMi0yOS42MSAzMS41LTI5LjYxIDI3LjcyMiAwIDM4LjQgMjguNCA3My4xIDI4LjM1IDIzLjk0IDAgMzQuNjUtMTIuNiAzNC42NS0yNS4yIDAtMTEuOTctOC44Mi0yNS4xOTgtNDEuNTgtNDIuMjFsLTI5LjYxLTE1LjEyYy00OC41MS0yNC41NjgtNjQuODktNTIuOTItNjQuODktOTAuMDkgMC00NC43MyA0MC4zMi04Ny41NyAxMDUuMjEtODcuNTcgNjguMDQgMCA5NS4xIDQxLjYgOTUuMSA2MC41IDAgMTUuNzUtMTEuOTcgMjguMzUtMzAuODcgMjguMzUtMjUuMiAwLTQwLjMxOC0yMi4wNS03MS44Mi0yMi4wNS0xNi4zOCAwLTI0LjU3IDExLjM0LTI0LjU3IDIxLjQgMCAxMy4yIDYuOSAyMC4yIDM0IDM1LjkxbDcuNTYyIDQuNDFjMTAuMDggNi4zIDIyLjcgMTEuMyAzMy40IDE3LjY0IDQ3Ljg4IDI1LjggNTkuOSA1Ni43IDU5LjkgODguMi0uMDMgNDUuMzMtMzUuODkgOTAuMTMtMTA4Ljk5IDkwLjA5eiIvPjxwYXRoIGZpbGw9IiM5OTkiIGQ9Ik02NjEuNDQzIDUzMi40MDhjLTUyLjI5IDAtOTMuMjQgNDAuOTUtOTMuMjQgOTEuOTggMCA1Mi4zIDQxIDkzLjIgOTMuMiA5My4yNCA1MS4wMyAwIDkxLjk4LTQwLjk1IDkxLjk4LTkzLjI0LjA0Mi01MC45ODgtNDAuODgzLTkxLjk4OC05MS45ODMtOTEuOTh6Ii8+PC9zdmc+'
    );

    add_submenu_page(
      \WC_POS\PLUGIN_NAME,
      __( 'View POS', 'woocommerce-pos' ),
      __( 'View POS', 'woocommerce-pos' ),
      'manage_woocommerce_pos',
      null
    );

    // adjust submenu
    global $submenu;
    $pos_submenu = &$submenu[\WC_POS\PLUGIN_NAME];
    $pos_submenu[0][0] = __( 'Upgrade to Pro', 'woocommerce-pos' );
    $pos_submenu[1][2] = wc_pos_url();
  }

  /**
   * @param $menu_order
   *
   * @return mixed
   */
  public function menu_order( $menu_order ) {
    $woo = array_search( 'woocommerce', $menu_order );
    $pos = array_search( \WC_POS\PLUGIN_NAME, $menu_order );

    if( $woo !== false && $pos !== false) {
      // rearrange menu
      unset( $menu_order[$pos] );
      array_splice( $menu_order, ++$woo, 0, \WC_POS\PLUGIN_NAME );

      // rearrange submenu
      global $submenu;
      $pos_submenu = &$submenu[\WC_POS\PLUGIN_NAME];
      $pos_submenu[500] = $pos_submenu[1];
      unset( $pos_submenu[1] );
    };

    return $menu_order;
  }

  /**
   * Render the upgrade page.
   */
  public function display_upgrade_page() {

    // Check for transient, if none, grab remote HTML file
    if ( false === ( $upgrade = get_transient( 'remote_pro_page' ) ) ) {
      // Get remote HTML file
      $response = wp_remote_get( 'http://wcpos.com/pro/?wp-admin=woocommerce-pos' );
      // Check for error
      if ( is_wp_error( $response ) ) {
        return;
      }
      // Parse remote HTML file
      $upgrade = wp_remote_retrieve_body( $response );
      // Check for error
      if ( is_wp_error( $upgrade ) ) {
        return;
      }
      // Store remote HTML file in transient, expire after 24 hours
      set_transient( 'remote_pro_page', $upgrade, 24 * \HOUR_IN_SECONDS );
    }
    include_once 'views/upgrade.php';
  }

}