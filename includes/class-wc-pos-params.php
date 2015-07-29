<?php
/**
 *
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
    add_filter( 'woocommerce_pos_params', array( $this, 'frontend_params' ), 5, 1 );
    add_filter( 'woocommerce_pos_admin_params', array( $this, 'admin_params' ), 5, 1 );
  }

  /**
   * Required parameters for the POS front end
   * @param array $params
   * @return array
   */
  public function frontend_params( array $params ) {
    $params['accounting']    = $this->accounting();
    $params['ajaxurl']       = admin_url( 'admin-ajax.php', 'relative' );
    $params['auto_print']    = $this->auto_print();
    $params['customers']     = $this->customers();
    $params['discount_keys'] = $this->discount_keys();
    $params['hotkeys']       = $this->hotkeys();
    $params['nonce']         = wp_create_nonce( WC_POS_PLUGIN_NAME );
    $params['shipping']      = $this->shipping_labels();
    $params['tabs']          = $this->product_tabs();
    $params['tax']           = $this->tax();
    $params['tax_labels']    = $this->tax_labels();
    $params['tax_rates']     = $this->tax_rates();
    $params['user']          = $this->user();
    $params['wc_api']        = get_woocommerce_api_url( '' );
    $params['emulateHTTP']   = get_option( 'woocommerce_pos_emulateHTTP' ) === '1';
    return $params;
  }

  /**
   * @param array $params
   * @return array
   */
  public function admin_params( array $params ) {
    $params['accounting'] = $this->accounting();
    $params['ajaxurl']    = admin_url( 'admin-ajax.php', 'relative' );
    $params['customers']  = $this->customers();
    $params['nonce']      = wp_create_nonce( WC_POS_PLUGIN_NAME );
    $params['wc_api']     = get_woocommerce_api_url( '' );
    $params['emulateHTTP']= get_option( 'woocommerce_pos_emulateHTTP' ) === '1';
    return $params;
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
   * Default hotkeys
   *
   * @return array
   */
  private function hotkeys() {
    $settings = new WC_POS_Admin_Settings_HotKeys();
    return $settings->get_data('hotkeys');
  }

  /**
   * Get the accounting format from user settings
   * POS uses a plugin to format currency: http://josscrowcroft.github.io/accounting.js/
   *
   * @return array $settings
   */
  private function accounting() {
    $decimal = get_option( 'woocommerce_price_decimal_sep' );
    $thousand = get_option( 'woocommerce_price_thousand_sep' );
    $precision = get_option( 'woocommerce_price_num_decimals' );
    return array(
      'currency' => array(
        'decimal' => $decimal,
        'format'  => $this->currency_format(),
        'precision' => $precision,
        'symbol'  => get_woocommerce_currency_symbol( get_woocommerce_currency() ),
        'thousand'  => $thousand,
      ),
      'number' => array(
        'decimal' => $decimal,
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
    $general = new WC_POS_Admin_Settings_General();
    $settings = $general->get_data();
    $user_id = false;

    if(isset($settings['customer']['id'])){
      $user_id = $settings['customer']['id'];
    }

    if(isset($settings['logged_in_user']) && $settings['logged_in_user']){
      $user_id = get_current_user_id();
    }

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

  static public function tax_classes(){
    $classes = array_filter( array_map( 'sanitize_title', explode( "\n", get_option('woocommerce_tax_classes' ) ) ) );
    array_unshift( $classes, '' ); // add 'standard'
    return $classes;
  }

  static public function tax_rates() {
    $rates = array();

    // get_shop_base_rate depreciated in 2.3
//    $get_rates = method_exists( 'WC_Tax','get_base_tax_rates' ) ? 'get_base_tax_rates' : 'get_shop_base_rate';

    foreach( self::tax_classes() as $class ) {
      if( $rate = WC_Tax::get_base_tax_rates( $class ) ){
        // WC_Tax returns a assoc array with int as keys = world of pain in js
        // possibly change $key to $rate['id']
        $rates[$class] = $rate;
      }
    }

    return $rates;
  }

  static public function tax_labels() {
    $labels = array(
      /* translators: woocommerce */
      '' => __( 'Standard', 'woocommerce' )
    );

    // get_tax_classes method introduced in WC 2.3
    if(method_exists( 'WC_Tax','get_tax_classes' )){
      $classes = WC_Tax::get_tax_classes();
    } else {
      $classes = array_filter( array_map( 'trim', explode( "\n", get_option( 'woocommerce_tax_classes' ) ) ) );
    }

    foreach($classes as $class){
      $labels[ sanitize_title($class) ] = $class;
    }

    return $labels;
  }

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

  private function discount_keys(){
    $settings = new WC_POS_Admin_Settings_General();
    return $settings->get_data('discount_quick_keys');
  }

  private function auto_print(){
    $settings = new WC_POS_Admin_Settings_Checkout();
    return $settings->get_data('auto_print_receipt');
  }

}