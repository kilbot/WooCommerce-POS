<?php

/**
 * POS System Status Class
 *
 * @class    WC_POS_Admin_Status
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Status extends WC_POS_Admin_Abstract {

  /* @var string JS var with page id, used for API requests */
  public $wc_pos_adminpage = 'admin_system_status';

  /**
   * @var array settings handlers
   */
  static public $handlers = array(
    'tools'     => 'WC_POS_Admin_Settings_Tools',
    'status'    => 'WC_POS_Admin_Settings_Status'
  );

  /**
   * Add Settings page to admin menu
   */
  public function admin_menu() {
    $this->screen_id = add_submenu_page(
      WC_POS_PLUGIN_NAME,
      /* translators: woocommerce */
      __( 'System Status', 'woocommerce' ),
      /* translators: woocommerce */
      __( 'System Status', 'woocommerce' ),
      'manage_woocommerce_pos',
      'wc_pos_system_status',
      array( $this, 'display_system_status_page' )
    );
  }

  /**
   * Output the settings pages
   */
  public function display_system_status_page() {
    include 'views/settings.php';
  }

  /**
   * Returns array of settings classes
   * @return mixed|void
   */
  static public function handlers(){
    return apply_filters( 'woocommerce_pos_admin_system_status_handlers', self::$handlers);
  }

  /**
   * Settings scripts
   */
  public function enqueue_admin_scripts() {

    //
    global $wp_scripts;
    $wp_scripts->queue = array();

    // deregister scripts
    wp_deregister_script( 'underscore' );
    wp_deregister_script( 'select2' );
    wp_deregister_script( 'backbone' );

    // register
    $external_libs = WC_POS_Template::get_external_js_libraries();
    wp_register_script( 'lodash', $external_libs[ 'lodash' ], array( 'jquery' ), null, true );
    wp_register_script( 'backbone', $external_libs[ 'backbone' ], array( 'jquery', 'lodash' ), null, true );
    wp_register_script( 'backbone.radio', $external_libs[ 'radio' ], array( 'jquery', 'backbone', 'lodash' ), null, true );
    wp_register_script( 'marionette', $external_libs[ 'marionette' ], array( 'jquery', 'backbone', 'lodash' ), null, true );
    wp_register_script( 'handlebars', $external_libs[ 'handlebars' ], false, null, true );
    wp_register_script( 'moment', $external_libs[ 'moment' ], false, null, true );
    wp_register_script( 'accounting', $external_libs[ 'accounting' ], false, null, true );
    wp_register_script( 'select2', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js', array( 'jquery' ), null, true );

    // enqueue
    wp_enqueue_script( 'jquery-ui-sortable' );

    $build = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'build' : 'min';

    wp_enqueue_script(
      WC_POS_PLUGIN_NAME . '-admin-system-status-app',
      WC_POS_PLUGIN_URL . 'assets/js/admin-system-status.' . $build . '.js',
      array( 'backbone', 'backbone.radio', 'marionette', 'handlebars', 'accounting', 'moment', 'select2' ),
      WC_POS_VERSION,
      true
    );

    $scripts = apply_filters( 'woocommerce_pos_admin_enqueue_scripts', array() );
    if ( isset( $scripts[ 'locale' ] ) ) {
      wp_enqueue_script(
        WC_POS_PLUGIN_NAME . '-js-locale',
        $scripts[ 'locale' ],
        array( WC_POS_PLUGIN_NAME . '-admin-system-status-app' ),
        WC_POS_VERSION,
        true
      );
    }
  }

}