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

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    if(!current_user_can('promote_users')){
      $this->current_user_authorized = false;
    }

    $this->id    = 'access';
    $this->label = __( 'POS Access', 'woocommerce-pos' );

    // capabilities
    $this->caps = apply_filters('woocommerce_pos_capabilities', array(
      'pos' => array(
        'manage_woocommerce_pos', // pos admin
        'access_woocommerce_pos'  // pos frontend
      ),
      'woo' => array(
        'read_private_products',
        'read_private_shop_orders',
        'publish_shop_orders',
        'list_users'
      ),
    ));

    // save action
    add_action('woocommerce_pos_settings_save_'.$this->id, array($this, 'save'));
  }

  /**
   * @param bool $key
   * @return array
   */
  public function get_data($key = false){
    return array(
      'roles' => $this->get_role_caps()
    );
  }

  /**
   * Get: Loop through roles and capabilities
   *
   * @return array
   */
  private function get_role_caps(){
    global $wp_roles;
    $role_caps = array();

    $roles = $wp_roles->roles;
    if($roles): foreach($roles as $slug => $role):
      $role_caps[$slug] = array(
        'name' => $role['name'],
        'capabilities' => array(
          'pos' => array_intersect_key(
            $role['capabilities'],
            array_flip($this->caps['pos'])
          ),
          'woo' => array_intersect_key(
            $role['capabilities'],
            array_flip($this->caps['woo'])
          )
        )
      );
    endforeach; endif;

    return $role_caps;
  }

  public function save( array $data ){
    if(isset($data['roles'])){
      $this->update_capabilities($data['roles']);
    }
  }

  /**
   * Set: Loop through roles and capabilities
   *
   * @param array $roles
   */
  private function update_capabilities( array $roles ){
    foreach($roles as $slug => $array):

      $role = get_role($slug);

      if( $array['capabilities'] ) : foreach( $array['capabilities'] as $key => $caps ):
        if( $caps ): foreach( $caps as $cap => $grant ):
          if( in_array( $cap, $this->caps[$key] ) ){
            $grant ? $role->add_cap($cap) : $role->remove_cap($cap);
          }
        endforeach; endif;
      endforeach; endif;

    endforeach;
  }

}