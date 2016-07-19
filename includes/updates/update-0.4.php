<?php
/**
 * Update to 0.4
 * - update license options
 *
 * @version   0.4
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

// update capabilities
$roles = array('administrator', 'shop_manager');
$caps = array('manage_woocommerce_pos', 'access_woocommerce_pos');
foreach($roles as $slug) :
  $role = get_role($slug);
  if($role) : foreach($caps as $cap) :
    $role->add_cap($cap);
  endforeach; endif;
endforeach;