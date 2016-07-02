<?php
/**
 * Update to 0.4.6
 * - fix reports bug
 *
 * @version   0.4.6
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

// fix pos orders
$args = array(
  'post_type'     => array('shop_order'),
  'post_status'   => array('any'),
  'posts_per_page'=>  -1,
  'fields'        => 'ids',
  'meta_query' => array(
    array(
      'key'     => '_pos',
      'value'   => 1,
      'compare' => '=',
    ),
  )
);

$query = new WP_Query( $args );

foreach( $query->posts as $order_id ){
  // check _order_tax and _order_shipping_tax for reports
  if( ! get_post_meta( $order_id, '_order_tax', true ) ){
    update_post_meta( $order_id, '_order_tax', 0 );
  }
  if( ! get_post_meta( $order_id, '_order_shipping_tax', true ) ){
    update_post_meta( $order_id, '_order_shipping_tax', 0 );
  }
}