<?php
/**
 * Template for the checkout settings
 */
?>

<h3><?php /* translators: woocommerce */ _e( 'Checkout Process', 'woocommerce' ); ?></h3>

<table class="form-table">

  <tr class="order_status">
    <th scope="row">
      <label for="order_status"><?php _e( 'Completed Order Status', 'woocommerce-pos' ); ?></label>
      <img title="<?php _e( 'Change the default order status for POS sales', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="tooltip">
    </th>
    <td>
      <select name="order_status" id="order_status">
        <?php $statuses = wc_get_order_statuses(); if( $statuses ): foreach( $statuses as $status => $status_name ):  ?>
          <option value="<?php echo esc_attr( $status ); ?>"><?php echo esc_html( $status_name ); ?></option>
        <?php endforeach; endif; ?>
      </select>
    </td>
  </tr>

  <tr class="order_emails">
    <th scope="row">
      <?php _e( 'Order Emails', 'woocommerce-pos' ); ?>
      <img title="<?php _e( 'blah', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="tooltip">
    </th>
    <td>
      <input type="checkbox" name="admin_emails" id="admin_emails" />
      <label for="order_emails">Enable admin emails</label>
      <br>
      <input type="checkbox" name="customer_emails" id="customer_emails" />
      <label for="order_emails">Enable customer emails</label>
    </td>
  </tr>

</table>

<h3><?php /* translators: woocommerce */ _e( 'Payment Gateways', 'woocommerce' ); ?></h3>

<p>
  <?php _e( 'Installed gateways are listed below. Drag and drop gateways to control their display order at the Point of Sale. ', 'woocommerce-pos' ); ?><br>
  <?php _e( 'Payment Gateways enabled here will be available at the Point of Sale. Payment Gateways enabled on the settings page will be available in your Online Store. ', 'woocommerce-pos' ); ?>
</p>

<p class="update-nag" style="font-size:13px;margin:0;">
  <?php _e( 'It is your responsibility to ensure the security of your customer\'s information. Transmitting credit card or other sensitive information should only be done using a secure connnection.', 'woocommerce-pos' ); ?>
  <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/security' ); ?>
</p>

<table class="form-table">

  <tr>
    <th scope="row"><?php _e( 'Gateway Display', 'woocommerce-pos' ) ?></th>
    <td>
      <table class="wc-gateways widefat sortable" cellspacing="0">
        <thead>
          <tr>
            <th scope="col"><?php /* translators: woocommerce */ _e( 'Default', 'woocommerce' ) ?></th>
            <th class="gateway-name" scope="col"><?php /* translators: woocommerce */ _e( 'Gateway', 'woocommerce' ) ?></th>
            <th class="gateway-id" scope="col"><?php /* translators: woocommerce */ _e( 'Gateway ID', 'woocommerce' ) ?></th>
            <th scope="col"><?php _e( 'Online Status', 'woocommerce-pos' ) ?></th>
            <th scope="col"><?php _e( 'POS Status', 'woocommerce-pos' ) ?></th>
            <th scope="col"><?php _e( 'POS Settings', 'woocommerce-pos' ) ?></th>
            <th scope="col"><?php /* translators: woocommerce */ _e( 'Settings', 'woocommerce' ) ?></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ( $this->load_gateways() as $gateway ) : ?>
            <tr>
              <td>
                <input type="radio" name="default_gateway" value="<?php echo esc_attr( $gateway->id ) ?>" />
                <input type="hidden" name="gateway_order.<?php echo $gateway->id ?>" class="gateway_order" />
              </td>
              <td class="gateway-name"><?php echo $gateway->get_title() ?></td>
              <td class="gateway-id"><?php echo esc_html( $gateway->id ) ?></td>
              <td>
                <?php if ( $gateway->enabled == 'yes' ): ?>
                  <span class="status-enabled" data-toggle="tooltip" title="<?php /* translators: woocommerce */ _e( 'Enabled', 'woocommerce' ); ?>"></span>
                <?php else: echo '-'; endif; ?>
              </td>
              <td>
                <?php if ( $gateway->pos ): ?>
                  <input type="checkbox" name="enabled.<?php echo $gateway->id ?>" />
                <?php else: ?>
                  <span class="status-disabled" data-toggle="tooltip" title="<?php _e( 'Upgrade to Pro', 'woocommerce-pos' ); ?>"></span>
                <?php endif; ?>
              </td>
              <td>
                <?php if ( $gateway->pos ): ?>
                  <a class="button gateway-settings" data-gateway="<?php echo $gateway->id ?>" href="#"><?php /* translators: woocommerce */ _e( 'Settings', 'woocommerce' ) ?></a>
                <?php endif; ?>
              </td>
              <td>
                <?php if( !in_array( $gateway->id, array( 'pos_cash', 'pos_card' ) ) ): ?>
                  <a class="button" href="<?php echo admin_url( 'admin.php?page=wc-settings&tab=checkout&section=' . strtolower( get_class( $gateway ) ) ) ?>"><?php /* translators: woocommerce */ _e( 'Settings', 'woocommerce' ) ?></a>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </td>
  </tr>
</table>

<a class="button-primary" data-action="save">
  <?php /* translators: wordpress */ echo esc_attr__( 'Save Changes' ); ?>
</a>
<p class="response"></p>

<table id="tmpl-gateway-settings-modal" class="form-table" style="display:none">
  <tr>
    <th scope="row">
      <label for="title"><?php /* translators: wordpress */ _e( 'Title' ); ?></label>
      <img data-toggle="tooltip" title="<?php _e( 'Payment method title.', 'woocommerce-pos' ); ?>" src="<?php echo esc_url( WC()->plugin_url() ); ?>/assets/images/help.png" height="16" width="16" />
    </th>
    <td><input id="title" name="title" type="text" /></td>
  </tr>
  <tr>
    <th scope="row">
      <label for="description"><?php /* translators: wordpress */ _e( 'Description' ); ?></label>
      <img data-toggle="tooltip" title="<?php _e( 'Payment method description that will be shown in the POS.', 'woocommerce-pos' ); ?>" src="<?php echo esc_url( WC()->plugin_url() ); ?>/assets/images/help.png" height="16" width="16" />
    </th>
    <td><textarea id="description" name="description"></textarea></td>
  </tr>
  <tr>
    <th scope="row">
      <label for="icon"><?php _e( 'Icon', 'woocommerce-pos' ); ?></label>
    </th>
    <td>
      <input id="icon" name="icon" type="checkbox" />
      <?php echo _x( 'Show payment gateway icon.', 'POS checkout settings', 'woocommerce-pos' ); ?>
    </td>
  </tr>
</table>