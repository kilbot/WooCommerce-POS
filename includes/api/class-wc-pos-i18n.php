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

    # GET /pos/params
    $routes[ $this->base ] = array(
      array( array( $this, 'get_translations' ), WC_API_Server::READABLE )
    );

    return $routes;

  }

  /**
   * @todo common, frontend and admin translations
   * @return array
   */
  public function get_translations(){

    return apply_filters( 'woocommerce_pos_i18n', array(
      'titles'   => array(
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
      ),
      'buttons'  => array(
        /* translators: woocommerce */
        'checkout'        =>  __( 'Checkout', 'woocommerce' ),
        'clear'           => _x( 'Clear', 'system status: delete local records', 'woocommerce-pos' ),
        /* translators: woocommerce */
        'close'           => __( 'Close' ),
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
        'restore'         => _x( 'Restore defaults', 'restore default settings', 'woocommerce-pos' ),
        'return'          => _x( 'return', 'Numpad return key', 'woocommerce-pos' ),
        'return-to-sale'  => __( 'Return to Sale', 'woocommerce-pos' ),
        /* translators: woocommerce */
        'save'            => __( 'Save Changes', 'woocommerce' ),
        'send'            => __( 'Send', 'woocommerce-pos' ),
        /* translators: woocommerce */
        'shipping'        => __( 'Shipping', 'woocommerce' ),
        'void'            => __( 'Void', 'woocommerce-pos' ),
        /* translators: woocommerce */
        'expand-all'      => __( 'Expand all', 'woocommerce' ),
        /* translators: woocommerce */
        'close-all'       => __( 'Close all', 'woocommerce' ),
        'legacy'          => __( 'Enable legacy server support', 'woocommerce-pos' ),
      ),
      'messages' => array(
        /* translators: woocommerce */
        'choose'      => __( 'Choose an option', 'woocommerce' ),
        /* translators: woocommerce */
        'error'       => __( 'Sorry, there has been an error.', 'woocommerce' ),
        'loading'     => __( 'Loading ...', 'woocommerce-pos' ),
        /* translators: woocommerce */
        'success'     => __( 'Your changes have been saved.', 'woocommerce' ),
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
      ),
      'plural'   => array(
        'records' => _x( 'record |||| records', 'eg: 23 records', 'woocommerce-pos' ),
      )
    ) );

  }

}