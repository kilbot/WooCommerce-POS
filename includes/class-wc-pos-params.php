<?php
/**
 * POS App parameters
 *
 * @class    WC_POS_Params
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Params {

  /**
   * Constructor
   */
  public function __construct() {

    // this should only be init after woocommerce_init
    global $wp_actions;
    if( ! isset($wp_actions['woocommerce_init']) ){
      return;
    }

    // common params
    $this->accounting      = $this->accounting();
    $this->ajaxurl         = admin_url( 'admin-ajax.php', 'relative' );
    $this->customers       = $this->customers();
    $this->debug           = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG;
    $this->nonce           = wp_create_nonce( WC_POS_PLUGIN_NAME );
    $this->wc_api          = get_woocommerce_api_url( '' );
    $this->emulateHTTP     = get_option( 'woocommerce_pos_emulateHTTP' ) === '1';
    $this->idbVersion      = WC_POS_Settings::get_idb_version();

    // frontend params
    if( is_pos() ){
      $this->auto_print    = wc_pos_get_option( 'checkout', 'auto_print_receipt' );
      $this->denominations = WC_POS_i18n::currency_denominations();
      $this->discount_keys = wc_pos_get_option( 'general', 'discount_quick_keys' );
      $this->hotkeys       = wc_pos_get_option( 'hotkeys', 'hotkeys' );
      $this->menu          = $this->menu();
      $this->shipping      = $this->shipping_labels();
      $this->store         = array( 'name' => get_bloginfo( 'name' ) );
      $this->tabs          = $this->product_tabs();
      $this->tax           = $this->tax();
      $this->tax_classes   = WC_POS_Tax::tax_classes();
      $this->tax_rates     = WC_POS_Tax::tax_rates();
      $this->user          = $this->user();
    }

  }

  /**
   * Params payload for
   * Converts class properties to array
   * @return array
   */
  public function payload() {
    return apply_filters( 'woocommerce_pos_params', get_object_vars( $this ), $this );
  }

  /**
   * Default quick tabs for products
   *
   * @return array
   */
  private function product_tabs() {
    return array(
      'all' => array(
        /* translators: woocommerce */
        'label' => __( 'All', 'woocommerce'),
        'active' => true
      ),
      'featured' => array(
        /* translators: woocommerce */
        'label' => __( 'Featured', 'woocommerce'),
        'id' => 'featured:true'
      ),
      'onsale' => array(
        'label' => _x( 'On Sale', 'Product tab: \'On Sale\' products', 'woocommerce-pos'),
        'id' => 'on_sale:true'
      ),
    );
  }

  /**
   * Get the accounting format from user settings
   * POS uses a plugin to format currency: http://josscrowcroft.github.io/accounting.js/
   *
   * @return array $settings
   */
  private function accounting() {
    $decimal    = get_option( 'woocommerce_price_decimal_sep' );
    $thousand   = get_option( 'woocommerce_price_thousand_sep' );
    $precision  = get_option( 'woocommerce_price_num_decimals' );
    return array(
      'currency' => array(
        'decimal'   => $decimal,
        'format'    => $this->currency_format(),
        'precision' => $precision,
        'symbol'    => get_woocommerce_currency_symbol( get_woocommerce_currency() ),
        'thousand'  => $thousand,
      ),
      'number' => array(
        'decimal'   => $decimal,
        'precision' => $precision,
        'thousand'  => $thousand,
      )
    );
  }

  /**
   * Get the currency format from user settings
   *
   * @return array $format
   */
  private function currency_format() {
    $currency_pos = get_option( 'woocommerce_currency_pos' );

    if( $currency_pos == 'right' )
      return array('pos' => '%v%s', 'neg' => '- %v%s', 'zero' => '%v%s');

    if( $currency_pos == 'left_space' )
      return array('pos' => '%s&nbsp;%v', 'neg' => '- %s&nbsp;%v', 'zero' => '%s&nbsp;%v');

    if( $currency_pos == 'right_space' )
      return array('pos' => '%v&nbsp;%s', 'neg' => '- %v&nbsp;%s', 'zero' => '%v&nbsp;%s');

    // default = left
    return array('pos' => '%s%v', 'neg' => '- %s%v', 'zero' => '%s%v');
  }

  /**
   * Get the default customer + guest
   *
   * @return object $customer
   */
  private function customers() {

    $user_id = wc_pos_get_option( 'general', 'logged_in_user' ) ?
      get_current_user_id() :
      wc_pos_get_option( 'general', 'default_customer' );

    if( $user_id ) {
      $user = get_userdata($user_id);
      $customers['default'] = array(
        'id' => $user->ID,
        'first_name'  => esc_html($user->first_name),
        'last_name'   => esc_html($user->last_name),
        'email'       => esc_html($user->user_email),
        'username'    => esc_html($user->user_login)
      );
    }

    $customers['guest'] = array(
      'id' => 0,
      /* translators: woocommerce */
      'first_name' => __( 'Guest', 'woocommerce' )
    );

    return $customers;
  }

  /**
   * Get the woocommerce shop settings
   *
   * @return array $settings
   */
  private function tax() {
    return array(
      'tax_label'             => WC()->countries->tax_or_vat(),
      'calc_taxes'            => get_option( 'woocommerce_calc_taxes' ),
      'prices_include_tax'    => get_option( 'woocommerce_prices_include_tax' ),
      'tax_round_at_subtotal' => get_option( 'woocommerce_tax_round_at_subtotal' ),
      'tax_display_cart'      => get_option( 'woocommerce_tax_display_cart' ),
      'tax_total_display'     => get_option( 'woocommerce_tax_total_display' ),
    );
  }

  /**
   * User settings
   *
   * @return array $settings
   */
  private function user() {
    global $current_user;

    return array(
      'id'      => $current_user->ID,
      'display_name'  => $current_user->display_name
    );
  }

  /**
   * @return array
   */
  static public function shipping_labels() {

    /* translators: woocommerce */
    $labels = array( '' => __( 'N/A', 'woocommerce' ) );

    $shipping_methods = WC()->shipping() ? WC()->shipping->load_shipping_methods() : array();

    foreach( $shipping_methods as $method ){
      $labels[$method->id] = $method->get_title();
    }

    /* translators: woocommerce */
    $labels['other'] = __( 'Other', 'woocommerce' );

    return $labels;
  }

  /**
   *
   */
  private function menu() {

    return apply_filters( 'woocommerce_pos_menu', array(
      array(
        'id'     => 'pos',
        'label'  => __( 'POS', 'woocommerce-pos' ),
        'href'   => '#'
      ),
      array(
        'id'     => 'products',
        /* translators: woocommerce */
        'label'  => __( 'Products', 'woocommerce' ),
        'href'   => admin_url('edit.php?post_type=product')
      ),
      array(
        'id'     => 'orders',
        /* translators: woocommerce */
        'label'  => __( 'Orders', 'woocommerce' ),
        'href'   => admin_url('edit.php?post_type=shop_order')
      ),
      array(
        'id'     => 'customers',
        /* translators: woocommerce */
        'label'  => __( 'Customers', 'woocommerce' ),
        'href'   => admin_url('users.php')
      ),
      array(
        'id'     => 'coupons',
        /* translators: woocommerce */
        'label' => __( 'Coupons', 'woocommerce' ),
        'href'   => admin_url('edit.php?post_type=shop_coupon')
      ),
      array(
        'id'     => 'support',
        /* translators: woocommerce */
        'label'  => __( 'Support', 'woocommerce' ),
        'href'   => '#support'
      )
    ));

  }

}