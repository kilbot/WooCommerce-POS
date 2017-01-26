<?php
/**
 * Update to 0.5
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

/**
 * Old General Settings
 */
$general_settings = get_option('woocommerce_pos_settings_general', array());

/**
 * New Product Settings
 */
$product_settings = array();
if( isset($general_settings['pos_only_products']) )
  $product_settings['pos_only_products'] = $general_settings['pos_only_products'];
if( isset($general_settings['decimal_qty']) )
  $product_settings['decimal_qty'] = $general_settings['decimal_qty'];

update_option('woocommerce_pos_settings_products',
  array_merge(
    get_option('woocommerce_pos_settings_products', array()),
    $product_settings
  )
);

/**
 * New Cart Settings
 */
$cart_settings = array();
if( isset($general_settings['discount_quick_keys']) )
  $cart_settings['discount_quick_keys'] = $general_settings['discount_quick_keys'];

update_option('woocommerce_pos_settings_cart',
  array_merge(
    get_option('woocommerce_pos_settings_cart', array()),
    $cart_settings
  )
);

/**
 * New Customer Settings
 */
$customer_settings = array();
if( isset($general_settings['default_customer']) )
  $customer_settings['default_customer'] = $general_settings['default_customer'];
if( isset($general_settings['logged_in_user']) )
  $customer_settings['logged_in_user'] = $general_settings['logged_in_user'];

update_option('woocommerce_pos_settings_customers',
  array_merge(
    get_option('woocommerce_pos_settings_customers', array()),
    $customer_settings
  )
);