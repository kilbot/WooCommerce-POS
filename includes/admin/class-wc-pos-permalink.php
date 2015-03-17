<?php

/**
 * Add a POS settings on the permalink admin page
 *
 * @class    WC_POS_Admin_Permlink
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Permalink {

  /**
   * Constructor
   */
  public function __construct() {
    $this->init();
    $this->save();
  }

  /**
   * Hook into the permalinks setting api
   */
  private function init() {
    add_settings_field(
      'woocommerce-pos-permalink',
      _x( 'POS base', 'Permalink setting, eg: /pos', 'woocommerce-pos' ),
      array( $this, 'pos_slug_input' ),
      'permalink',
      'optional'
    );
  }

  /**
   * Output the POS field
   */
  public function pos_slug_input() {
    $permalink = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'permalink' );
    if( ! $permalink ) $permalink = '';
    echo '<input name="woocommerce_pos_permalink" type="text" class="regular-text code" value="'. esc_attr( $permalink ) .'" placeholder="pos" />';
  }

  /**
   * Watch for $_POST and save POS setting
   */
  public function save() {
    if( isset( $_POST['woocommerce_pos_permalink'] ) ) {
      $permalink = untrailingslashit( sanitize_text_field( $_POST['woocommerce_pos_permalink'] ) );
      if( $permalink != '' ) {
        update_option( WC_POS_Admin_Settings::DB_PREFIX . 'permalink', $permalink );
      }
    }
  }

}