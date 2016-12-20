<?php

/**
 * POS App parameters
 *
 * @class    WC_POS_API_Params
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\API;

use WC_API_Resource;
use WC_API_Server;
use WC_POS\Admin\Settings;
use WC_POS\i18n;
use WC_POS\Tax;

class Params extends WC_API_Resource {

  protected $base = '/pos/params';

  /**
   * Register routes for POS Params
   *
   * GET /pos
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( array $routes ){

    # GET /pos/params
    $routes[ $this->base ] = array(
      array( array( $this, 'get_params' ), WC_API_Server::READABLE )
    );

    return $routes;

  }

  /**
   * @param null $wc_pos_admin
   * @return array
   */
  public function get_params( $wc_pos_admin = null ){
    if( $wc_pos_admin ){
      $params = apply_filters( 'woocommerce_pos_{$wc_pos_admin}_params', $this->common_params() + $this->admin_params(), $this );
    } else {
      $params = apply_filters( 'woocommerce_pos_params', $this->common_params() + $this->frontend_params(), $this );
    }
    return $params;
  }

  /**
   *
   */
  private function common_params(){
    return array(
      'accounting'    => $this->accounting(),
      'customers'     => $this->customers(),
      'debug'         => defined( '\SCRIPT_DEBUG' ) && \SCRIPT_DEBUG,
      'emulateHTTP'   => get_option( 'woocommerce_pos_emulateHTTP' ) === '1',
      'idbVersion'    => Settings::get_idb_version(),
      'localDBPrefix' => $this->local_db_prefix(),
      'store'         => array( 'name' => html_entity_decode( get_bloginfo( 'name' ) ) ),
      'language'      => get_locale()
    );
  }

  /**
   *
   */
  private function frontend_params(){
    return array(
      'auto_print'    => wc_pos_get_option( 'checkout', 'auto_print_receipt' ),
      'denominations' => i18n::currency_denominations(),
      'discount_keys' => wc_pos_get_option( 'products', 'discount_quick_keys' ),
      'fee'           => wc_pos_get_option( 'cart', 'fee' ),
      'hotkeys'       => wc_pos_get_option( 'hotkeys', 'hotkeys' ),
      'menu'          => $this->menu(),
      'shipping'      => $this->shipping(),
      'tabs'          => wc_pos_get_option( 'products', 'tabs' ),
      'tax'           => $this->tax(),
      'tax_classes'   => Tax::tax_classes(),
      'tax_rates'     => Tax::tax_rates(),
      'user'          => $this->user()
    );
  }

  /**
   *
   */
  private function admin_params(){
    return array(
      'search_customers_nonce' => wp_create_nonce( 'search-customers' ),
      'nonce'       => wp_create_nonce( \WC_POS\PLUGIN_NAME ),
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

    $user_id = wc_pos_get_option( 'customers', 'logged_in_user' ) ?
      get_current_user_id() :
      wc_pos_get_option( 'customers', 'default_customer' );

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
      'id'           => $current_user->ID,
      'username'     => $current_user->user_login,
      'first_name'   => $current_user->user_firstname,
      'last_name'    => $current_user->user_lastname,
      'display_name' => $current_user->display_name,
      'email'        => $current_user->user_email
    );
  }

  /**
   *
   */
  private function shipping(){
    $shipping = wc_pos_get_option( 'cart', 'shipping' );
    $shipping['labels'] = self::shipping_labels();
    return $shipping;
  }

  /**
   * @return array
   */
  static public function shipping_labels() {

    /* translators: woocommerce */
    $labels = array( '' => __( 'N/A', 'woocommerce' ) );

    $shipping_methods = WC()->shipping() ? WC()->shipping->load_shipping_methods() : array();

    foreach( $shipping_methods as $method ){
      $labels[$method->id] = $method->get_method_title();
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

  /**
   *
   */
  private function local_db_prefix(){
    $pieces = array('wcpos');
    $pieces[] = get_current_blog_id(); // site id
    $pieces[] = get_current_user_id(); // user id
    $string = implode('_', $pieces) . '_';

    return apply_filters( 'woocommerce_pos_local_db_prefix', $string, $pieces );
  }

}