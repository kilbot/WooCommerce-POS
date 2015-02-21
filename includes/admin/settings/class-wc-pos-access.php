<?php

/**
 * Administrative Tools
 *
 * @class    WC_POS_Admin_Settings_Tools
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Access extends WC_POS_Admin_Settings_Abstract {

  public static $poscaps = array(
    'manage_woocommerce_pos', // pos admin
    'access_woocommerce_pos'  // pos frontend
  );

  public static $woocaps = array(

    // products
    'read_private_products',
    'publish_products',
    'manage_product_terms',

    // orders
    'read_private_shop_orders',
    'publish_shop_orders',

    // customers
    'list_users',
    'create_users',
    'edit_users',
//    'delete_users',

    // coupons
    'read_private_shop_coupons',
    'publish_shop_coupons'
  );

  // base caps required to use the POS
  public static $reqcaps = array(
    'access_woocommerce_pos',
    'read_private_products',
    'publish_shop_orders',
    'list_users'
  );

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    if(!current_user_can('promote_users')){
      $this->current_user_authorized = false;
    }

    $this->id    = 'access';
    $this->label = __( 'POS Access', 'woocommerce-pos' );

    // save action
    add_action('woocommerce_pos_settings_save_'.$this->id, array($this, 'save'));
  }

  public function get_data($key = false){
    return array(
      'roles' => $this->get_role_caps()
    );
  }

  private function get_role_caps(){
    global $wp_roles;
    $role_caps = array();

    $roles = $wp_roles->roles;
    if($roles): foreach($roles as $slug => $role):
      $role_caps[$slug] = array(
        'name' => $role['name'],
        'pos_capabilities' => array_intersect_key(
          $role['capabilities'],
          array_flip(self::$poscaps)
        ),
        'woo_capabilities' => array_intersect_key(
          $role['capabilities'],
          array_flip(self::$woocaps)
        ),
      );
    endforeach; endif;

    return $role_caps;
  }

  public function save( array $data ){
    if(isset($data['roles'])){
      $this->update_capabilities($data['roles']);
    }
  }

  private function update_capabilities( array $roles ){
    foreach($roles as $slug => $array):
      $role = get_role($slug);

      // pos
      if(isset($array['pos_capabilities'])):
        foreach($array['pos_capabilities'] as $capability => $grant):
          if(in_array($capability, self::$poscaps)){
            $grant ? $role->add_cap($capability) : $role->remove_cap($capability);
          }
        endforeach;
      endif;

      if(isset($array['woo_capabilities'])):
        foreach($array['woo_capabilities'] as $capability => $grant):
          if(in_array($capability, self::$woocaps)){
            $grant ? $role->add_cap($capability) : $role->remove_cap($capability);
          }
        endforeach;
      endif;

    endforeach;
  }

}