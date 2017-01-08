<?php
/**
 * Update to 0.5
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

/**
 * Product Settings
 */
$pos_only_products = wc_pos_get_option('general', 'pos_only_products');
$decimal_qty = wc_pos_get_option('general', 'decimal_qty');

$product_settings = get_option('woocommerce_pos_settings_products', array());
update_option('woocommerce_pos_settings_products', array_merge($product_settings, array(
  'pos_only_products' => $pos_only_products,
  'decimal_qty' => $decimal_qty
)));

/**
 * Cart Settings
 */
$discount_quick_keys = wc_pos_get_option('general', 'discount_quick_keys');

$cart_settings = get_option('woocommerce_pos_settings_cart', array());
update_option('woocommerce_pos_settings_cart', array_merge($cart_settings, array(
  'discount_quick_keys' => $discount_quick_keys
)));

/**
 * Customer Settings
 */
$default_customer = wc_pos_get_option('general', 'default_customer');
$logged_in_user = wc_pos_get_option('general', 'logged_in_user');

$customer_settings = get_option('woocommerce_pos_settings_customers', array());
update_option('woocommerce_pos_settings_customers', array_merge($customer_settings, array(
  'default_customer' => $default_customer,
  'logged_in_user' => $logged_in_user
)));