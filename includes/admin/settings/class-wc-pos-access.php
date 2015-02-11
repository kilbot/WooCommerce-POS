<?php

/**
 * Administrative Tools
 *
 * @class    WC_POS_Admin_Settings_Tools
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_Access extends WC_POS_Admin_Settings_Page {

  public static $pos_capabilities = array(
    'manage_woocommerce_pos', // pos admin
    'access_woocommerce_pos'  // pos frontend
  );

  public static $woo_capabilities = array(

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
    'delete_users',

    // coupons
    'read_private_shop_coupons',
    'publish_shop_coupons'
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

  public function output(){
    include 'views/' . $this->id . '.php';
  }

  public function get_data(){
    if(!$this->data){
      $this->data = array(
        'roles' => $this->get_role_caps()
      );
    }
    return $this->data;
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
          array_flip(self::$pos_capabilities)
        ),
        'woo_capabilities' => array_intersect_key(
          $role['capabilities'],
          array_flip(self::$woo_capabilities)
        ),
      );
      // TODO: fix this .. empty array is bad
      if(empty($role_caps[$slug]['pos_capabilities'])){
        $role_caps[$slug]['pos_capabilities'] = new StdClass;
      }
      if(empty($role_caps[$slug]['woo_capabilities'])){
        $role_caps[$slug]['woo_capabilities'] = new StdClass;
      }
    endforeach; endif;

    return $role_caps;
  }

  public function save( array $data ){
    error_log(print_r($data, true));
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
          if(in_array($capability, self::$pos_capabilities)){
            $grant ? $role->add_cap($capability) : $role->remove_cap($capability);
          }
        endforeach;
      endif;

      if(isset($array['woo_capabilities'])):
        foreach($array['woo_capabilities'] as $capability => $grant):
          if(in_array($capability, self::$woo_capabilities)){
            $grant ? $role->add_cap($capability) : $role->remove_cap($capability);
          }
        endforeach;
      endif;

    endforeach;
  }

}