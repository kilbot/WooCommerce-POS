<?php
/**
 * Template for the general settings
 */
?>

<h3><?php /* translators: woocommerce */ _e( 'General Options', 'woocommerce' ); ?></h3>

<table class="form-table">

  <tr>
    <th scope="row">
      <label for="pos_only_products"><?php _e( 'Product Visibility', 'woocommerce-pos' ) ?></label>
    </th>
    <td>
      <input type="checkbox" name="pos_only_products" id="pos_only_products" />
      <?php printf( __( 'Enable <a href="%s">POS Only products</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/pos-only-products/' )?>.
    </td>
  </tr>

  <tr class="default_customer">
    <th scope="row">
      <label><?php _e( 'Default POS Customer', 'woocommerce-pos' ); ?></label>
      <img title="<?php _e( 'The default customer for POS orders, eg: Guest or create a new customer.', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="tooltip">
    </th>
    <td>
      <div data-component="customer-select"></div>
      <input type="checkbox" name="logged_in_user" id="logged_in_user">
      <label for="logged_in_user"><?php _ex( 'Use cashier account', 'Default customer setting', 'woocommerce-pos' ) ?></label>
    </td>
  </tr>

</table>