<?php
/**
 * Template for the general settings
 */
?>

<h3><?php /* translators: woocommerce */ _e( 'General Options', 'woocommerce' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="force_ssl"><?php _e( 'Force SSL (HTTPS)', 'woocommerce-pos' ) ?></label>
      <img title="<?php esc_attr_e( 'Force SSL (HTTPS) on the POS page (a SSL Certificate is required).', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="wc_pos-tooltip">
    </th>
    <td>
      <input type="checkbox" name="force_ssl" id="force_ssl" />
      <?php _e('Force secure POS', 'woocommerce-pos'); ?>
    </td>
  </tr>

</table>