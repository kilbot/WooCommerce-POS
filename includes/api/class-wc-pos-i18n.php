<?php

/**
 * i18n values
 *
 * @class    WC_POS_API_i18n
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

class WC_POS_API_i18n extends WC_API_Resource {

  protected $base = '/pos/i18n';

  /**
   * Register routes for POS Params
   *
   * GET /pos
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( array $routes ) {

    # GET /pos/i18n
    $routes[ $this->base ] = array(
      array( array( $this, 'get_translations' ), WC_API_Server::READABLE )
    );

    return $routes;

  }

  /**
   * @return array
   */
  public function get_translations(){

    return apply_filters( 'woocommerce_pos_i18n', array(
      'titles'   => $this->titles(),
      'buttons'  => $this->buttons(),
      'messages' => $this->messages(),
      'plural'   => $this->plural()
    ) );

  }

  /**
   * @return array
   */
  private function titles(){
    $titles = is_pos_admin() ? $this->admin_titles() : $this->frontend_titles();
    return $titles + $this->common_titles();
  }

  /**
   * @return array
   */
  private function buttons(){
    $buttons = is_pos_admin() ? $this->admin_buttons() : $this->frontend_buttons();
    return $buttons + $this->common_buttons();
  }

  /**
   * @return array
   */
  private function messages(){
    $messages = is_pos_admin() ? $this->admin_messages() : $this->frontend_messages();
    return $messages + $this->common_messages();
  }

  /**
   * @return array
   */
  private function plural(){
    if( !is_pos_admin() ){
      return array(
        'records' => _x( 'record |||| records', 'eg: 23 records', 'woocommerce-pos' ),
      );
    }
  }

  /**
   * @return array
   */
  private function common_titles(){
    return array(
      'more-info' => __( 'More info', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'error'     => __( 'Error', 'woocommerce' ),
    );
  }

  /**
   * @return array
   */
  private function admin_titles(){
    return array();
  }

  /**
   * @return array
   */
  private function frontend_titles(){
    return array(
      'browser'       => _x( 'Browser', 'system status: browser capabilities', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'cart'          => __( 'Cart', 'woocommerce' ),
      /* translators: woocommerce */
      'checkout'      => __( 'Checkout', 'woocommerce' ),
      /* translators: woocommerce */
      'coupons'       => __( 'Coupons', 'woocommerce' ),
      /* translators: woocommerce */
      'customers'     => __( 'Customers', 'woocommerce' ),
      /* translators: woocommerce */
      'fee'           => __( 'Fee', 'woocommerce' ),
      'hotkeys'       => _x( 'HotKeys', 'keyboard shortcuts', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'order'         => __( 'Order', 'woocommerce' ),
      /* translators: woocommerce */
      'orders'        => __( 'Orders', 'woocommerce' ),
      /* translators: woocommerce */
      'products'      => __( 'Products', 'woocommerce' ),
      'receipt'       => __( 'Receipt', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'shipping'      => __( 'Shipping', 'woocommerce' ),
      'to-pay'        => __( 'To Pay', 'woocommerce-pos' ),
      'paid'          => __( 'Paid', 'woocommerce-pos' ),
      'unpaid'        => __( 'Unpaid', 'woocommerce-pos' ),
      'email-receipt' => __( 'Email Receipt', 'woocommerce-pos' ),
      'open'          => _x( 'Open', 'order status, ie: open order in cart', 'woocommerce-pos' ),
      'change'        => _x( 'Change', 'Money returned from cash sale', 'woocommerce-pos' ),
      'support-form'  => __( 'Support Form', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'system-status' => __( 'System Status', 'woocommerce' ),
    );
  }

  /**
   * @return array
   */
  private function common_buttons() {
    return array(
      /* translators: woocommerce */
      'save'    => __( 'Save Changes', 'woocommerce' ),
      /* translators: wordpress */
      'close'   => __( 'Close' ),
      /* translators: wordpress */
      'disable' => __( 'Disable' ),
      /* translators: wordpress */
      'enable'  => __( 'Enable' )
    );
  }

  /**
   * @return array
   */
  private function admin_buttons(){
    return array(
      'restore'         => _x( 'Restore defaults', 'restore default settings', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'delete-template' => __( 'Delete template file', 'woocommerce' ),
      /* translators: woocommerce */
      'copy-file'       => __( 'Copy file to theme', 'woocommerce' ),
    );
  }

  /**
   * @return array
   */
  private function frontend_buttons(){
    return array(
      /* translators: woocommerce */
      'checkout'        => __( 'Checkout', 'woocommerce' ),
      'clear'           => _x( 'Clear', 'system status: delete local records', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'coupon'          => __( 'Coupon', 'woocommerce' ),
      'discount'        => __( 'Discount', 'woocommerce-pos' ),
      /* translators: wordpress */
      'email'           => __( 'Email' ),
      /* translators: woocommerce */
      'fee'             => __( 'Fee', 'woocommerce' ),
      /* translators: woocommerce */
      'new-order'       => __( 'New Order', 'woocommerce' ),
      /* translators: woocommerce */
      'note'            => __( 'Note', 'woocommerce' ),
      /* translators: wordpress */
      'print'           => __( 'Print' ),
      'process-payment' => __( 'Process Payment', 'woocommerce-pos' ),
      /* translators: wordpress */
      'refresh'         => __( 'Refresh' ),
      'return'          => _x( 'return', 'Numpad return key', 'woocommerce-pos' ),
      'return-to-sale'  => __( 'Return to Sale', 'woocommerce-pos' ),
      'send'            => __( 'Send', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'shipping'        => __( 'Shipping', 'woocommerce' ),
      'void'            => __( 'Void', 'woocommerce-pos' ),
      'split'           => __( 'Split', 'woocommerce-pos' ),
      'combine'         => __( 'Combine', 'woocommerce-pos' ),
    );
  }

  /**
   * @return array
   */
  private function common_messages(){
    return array(
      /* translators: woocommerce */
      'choose'      => __( 'Choose an option', 'woocommerce' ),
      /* translators: woocommerce */
      'error'       => __( 'Sorry, there has been an error.', 'woocommerce' ),
      'loading'     => __( 'Loading ...', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'success'     => __( 'Your changes have been saved.', 'woocommerce' ),
    );
  }

  /**
   * @return array
   */
  private function admin_messages(){
    return array();
  }

  /**
   * @return array
   */
  private function frontend_messages(){
    return array(
      'browser'     => __( 'Your browser is not supported!', 'woocommerce-pos' ),
      'legacy'      => __( 'Unable to use RESTful HTTP methods', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'no-products' => __( 'No Products found', 'woocommerce' ),
      /* translators: woocommerce */
      'cart-empty'  => __( 'Your cart is currently empty.', 'woocommerce' ),
      'no-gateway'  => __( 'No payment gateways enabled.', 'woocommerce-pos' ),
      /* translators: woocommerce */
      'no-customer' => __( 'Customer not found', 'woocommerce' ),
      'private-browsing' => sprintf( __( 'WooCommerce POS will not work in <a href="%s">Private Mode</a>, please disable Private Browsing.', 'woocommerce-pos' ), 'https://wikipedia.org/wiki/Privacy_mode' ),
    );
  }

}