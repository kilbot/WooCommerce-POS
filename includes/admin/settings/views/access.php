<?php
/**
 * Template for the POS access settings
 */
?>

<h3><?php _e( 'Grant POS Access', 'woocommerce-pos' ); ?></h3>

<p class="update-nag" style=font-size:13px;margin:0;">
  <?php _e( 'By default, access to the POS is limited to Administrator and Shop Manager roles.', 'woocommerce-pos' ); ?>
  <?php _e( 'It is recommended that you <strong>do not change</strong> the default settings unless you are fully aware of the consequences.', 'woocommerce-pos' ); ?>
  <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/pos-access' ); ?>
</p>

<ul class="wc-pos-access-panel">
  <?php $data = $this->get_data(); if($data): foreach($data['roles'] as $key => $role): ?>
    <li>
      <strong><?php echo translate_user_role($role['name']); ?></strong>
      <ul>
        <?php if($this::$pos_capabilities): foreach($this::$pos_capabilities as $cap): ?>
          <li>
            <input type="checkbox"
                   name="roles.<?php echo esc_attr($key); ?>.pos_capabilities.<?php echo esc_attr($cap); ?>">
            <?php echo $cap; ?>
          </li>
        <?php endforeach; endif; ?>
        <?php if($this::$woo_capabilities): foreach($this::$woo_capabilities as $cap): ?>
          <li>
            <input type="checkbox"
                   name="roles.<?php echo esc_attr($key); ?>.woo_capabilities.<?php echo esc_attr($cap); ?>">
            <?php echo $cap; ?>
          </li>
        <?php endforeach; endif; ?>
      </ul>
    </li>
  <?php endforeach; endif; ?>
</ul>

<a class="button-primary" data-action="save">
  <?php /* translators: wordpress */ echo esc_attr__( 'Save Changes' ); ?>
</a>
<p class="response"></p>