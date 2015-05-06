<?php

/**
* WP Admin Class
*
* @class    WC_POS_Admin
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Admin {

  /* @var array Stores admin notices */
  private $notices = array();

  /**
   * Constructor
   */
  public function __construct() {

    $this->init();
    add_action( 'current_screen', array( $this, 'conditional_init' ) );
    add_action( 'admin_print_scripts', array( $this, 'admin_print_scripts' ) );
    add_action( 'admin_notices', array( $this, 'admin_notices' ) );
    add_action( 'woocommerce_pos_add_admin_notice', array( $this, 'add_admin_notice' ) );

  }

  /**
   * Load admin subclasses
   */
  public function init() {
    new WC_POS_Admin_Menu();
    new WC_POS_Admin_Settings();
  }

  public function conditional_init( $current_screen ) {

    // Add setting to permalink page
    if( $current_screen->id == 'options-permalink' )
      new WC_POS_Admin_Permalink();

    // Add POS settings to orders pages
    if( $current_screen->id == 'shop_order' || $current_screen->id == 'edit-shop_order'  )
      new WC_POS_Admin_Orders();

  }

  /**
   *
   */
  public function admin_print_scripts(){
    if(defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG){
      echo '<script type="text/javascript">var wc_pos_debug = true;</script>';
    }
  }

  /**
   * Display the admin notices
   */
  public function admin_notices() {

    if( !empty( $this->notices ) ) {
      foreach( $this->notices as $notice ) {
        echo '<div class="' . $notice['msg_type'] . '">
          <p>'. wp_kses( $notice['msg'], wp_kses_allowed_html( 'post' ) ) .'</p>
				</div>';
      }
    }

  }

  /**
   * Add admin notices for display
   * @param $notice
   */
  public function add_admin_notice($notice){
    array_push( $this->notices, $notice );
  }

}