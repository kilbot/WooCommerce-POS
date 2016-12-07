<?php

/**
 * POS Settings Class
 *
 * @class    WC_POS_Admin_Settings
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\Admin;

use WC_POS\Template;

class Settings extends Page {

  /* @var string JS var with page id, used for API requests */
  public $wc_pos_adminpage = 'admin_settings';

  /**
   * @var array settings handlers
   */
  static public $handlers = array(
    'general'   => '\WC_POS\Admin\Settings\General',
    'products'  => '\WC_POS\Admin\Settings\Products',
    'cart'      => '\WC_POS\Admin\Settings\Cart',
    'customers' => '\WC_POS\Admin\Settings\Customers',
    'checkout'  => '\WC_POS\Admin\Settings\Checkout',
    'receipts'  => '\WC_POS\Admin\Settings\Receipts',
    'hotkeys'   => '\WC_POS\Admin\Settings\HotKeys',
    'access'    => '\WC_POS\Admin\Settings\Access'
  );

  /**
   * Add Settings page to admin menu
   */
  public function admin_menu() {
    $this->screen_id = add_submenu_page(
      \WC_POS\PLUGIN_NAME,
      /* translators: wordpress */
      __( 'Settings' ),
      /* translators: wordpress */
      __( 'Settings' ),
      'manage_woocommerce_pos',
      'wc_pos_settings',
      array( $this, 'display_settings_page' )
    );

    // setup help panel on screen load
    // add_action( 'load-' . $this->screen_id, array( $this, 'add_help_panel' ) );

    parent::admin_menu();
  }

  /**
   * will be called as a 'load-my-screen' action callback
   * @see WC_POS\Admin\Page::admin_menu
   *
   */
  public function conditional_init() {

    // help panel setup
    $this->add_help_panel();

    // not to be omitted because
    // parent (Page) will loadd all necessary scripts
    // for the screen
    parent::conditional_init();

  }

  /**
   * Sets up the help panel tabs
   * for each sections of the POS Settings
   *
   *
   *
   */
  function add_help_panel() {

    $screen = get_current_screen();

    if(!$screen) {
      return;
    }

    // use Settings sections handlers as source for the help panel
    foreach($this->handlers() as $id => $class) {

      $handler = $class::get_instance();

      $screen->add_help_tab( array(
        'id'       => 'wcpos-settings-' . $id,
        'title'    => __( $handler->label, 'woocommerce-pos' ),
        'content'  => $this->display_help_page($handler),
      ));

    }

  }

  /**
   * Render the help content for the Settings sections
   * Will fetch content from a remote source for easy updating
   *
   * content url is set (for now) as a Section class parameter
   * @todo decide where the content url should be stored
   * @todo decide where the content could be stored and in what form (.md, .html ...)
   *
   */
  public function display_help_page($handler) {


    $before_help_content = '<p>';
    $after_help_content = '</p>';

    $default_content = sprintf(
      "%s%s%s",
      $before_help_content,
      'Help page for ' . __( $handler->label, 'woocommerce-pos' ),
      $after_help_content
    );

    if(!isset($handler->help_page_url)) {
      return $default_content;
    }

    $transient_id = 'wcpos-settings-' . $handler->id;

    if(WP_DEBUG) {
      delete_transient( $transient_id );
    }

    // Check for transient, if none, grab remote HTML file
    if ( false === ( $help_page = get_transient( $transient_id ) ) ) {

      // Get remote file
      $response = wp_remote_get( $handler->help_page_url );

      // Check for error
      if ( is_wp_error( $response ) ) {
        return $default_content;
      }

      // Parse remote file
      $help_page = wp_remote_retrieve_body( $response );

      // Check for error
      if ( is_wp_error( $help_page ) ) {
        return $default_content;
      }

      // markdown?
      if(preg_match('/\.md$/', $handler->help_page_url)) {
        require_once(__DIR__ . '/../../vendor/Parsedown.php');
        $mdprsr = new \Parsedown();
        $help_page = $mdprsr->text($help_page);
      }

      // Store parsed file in transient, expire after 24 hours
      set_transient( $transient_id, $help_page, 24 * \HOUR_IN_SECONDS );


    }

    return $help_page;

  }


  /**
   * Output the settings pages
   */
  public function display_settings_page() {
    include 'views/settings.php';
  }

  /**
   * Returns array of settings classes
   * @return mixed|void
   */
  static public function handlers(){
    return apply_filters( 'woocommerce_pos_admin_settings_handlers', self::$handlers );
  }

  /**
   * Settings scripts
   */
  public function enqueue_admin_scripts() {
    global $wp_scripts;

    // remove all queued scripts from queue
    // to avoid unwanted conflicts with js loaded by other plugins
    // keep WP common.js to operate help panel
    foreach($wp_scripts->queue as $k => $script_handle) {
      if($script_handle !== 'common') {
        unset($wp_scripts->queue[$k]);
      }
    }

    // deregister scripts
    wp_deregister_script( 'jquery' );
    wp_deregister_script( 'underscore' );
    wp_deregister_script( 'select2' );
    wp_deregister_script( 'backbone' );

    $build = defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG ? 'build' : 'min';

    // register
    $external_libs = Template::get_external_js_libraries();
    wp_register_script( 'jquery', $external_libs[ 'jquery' ], false, null, true );
    wp_register_script( 'lodash', $external_libs[ 'lodash' ], array( 'jquery' ), null, true );
    wp_register_script( 'backbone', $external_libs[ 'backbone' ], array( 'jquery', 'lodash' ), null, true );
    wp_register_script( 'backbone.radio', $external_libs[ 'radio' ], array( 'jquery', 'backbone', 'lodash' ), null, true );
    wp_register_script( 'marionette', $external_libs[ 'marionette' ], array( 'jquery', 'backbone', 'lodash' ), null, true );
    wp_register_script( 'handlebars', $external_libs[ 'handlebars' ], false, null, true );
    wp_register_script( 'moment', $external_libs[ 'moment' ], false, null, true );
    wp_register_script( 'accounting', $external_libs[ 'accounting' ], false, null, true );
    wp_register_script( 'select2', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.full.min.js', array( 'jquery' ), null, true );
    wp_register_script( 'ace', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js', false, null, true );
    wp_register_script( 'qz-tray', \WC_POS\PLUGIN_URL . '/assets/js/vendor/qz-tray.' . $build . '.js', false, null, true );

    // enqueue jquery UI sortable
    wp_enqueue_script ('jquery-ui-sortable');

    wp_enqueue_script(
      \WC_POS\PLUGIN_NAME . '-admin-settings-app',
      \WC_POS\PLUGIN_URL . 'assets/js/admin-settings.' . $build . '.js',
      array( 'backbone', 'backbone.radio', 'marionette', 'handlebars', 'accounting', 'moment', 'select2', 'ace', 'qz-tray' ),
      \WC_POS\VERSION,
      true
    );

    $scripts = apply_filters( 'woocommerce_pos_admin_enqueue_scripts', array() );
    if ( isset( $scripts[ 'locale' ] ) ) {
      wp_enqueue_script(
        \WC_POS\PLUGIN_NAME . '-js-locale',
        $scripts[ 'locale' ],
        array( \WC_POS\PLUGIN_NAME . '-admin-settings-app' ),
        \WC_POS\VERSION,
        true
      );
    }
  }

}