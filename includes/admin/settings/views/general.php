<?php
/**
 * Template for the general settings
 */

use WC_POS\API\Params;
use WC_POS\Tax;

?>

<h3><?php /* translators: woocommerce */ _e( 'General Options', 'woocommerce' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="pos_only_products"><?php _e( 'Product Visibility', 'woocommerce-pos' ) ?></label>
    </th>
    <td>
      <input type="checkbox" name="pos_only_products" id="pos_only_products" />
      <?php printf( __( 'Enable <a href="%s">POS Only products</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/pos-only-products/' )?>.
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="decimal_qty"><?php _e( 'Allow Decimal Quantity', 'woocommerce-pos' ) ?></label>
      <img title="<?php esc_attr_e( 'Allows items to have decimal values in the quantity field, eg: 0.25', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="wc_pos-tooltip">
    </th>
    <td>
      <input type="checkbox" name="decimal_qty" id="decimal_qty" />
      <?php /* translators: wordpress */ _e('Enable'); ?>
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="discount_quick_keys"><?php _e( 'Discount Quick Keys', 'woocommerce-pos' ) ?></label>
      <img title="<?php esc_attr_e( 'Configure discount keys for quick numpad entry', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="wc_pos-tooltip">
    </th>
    <td>
      <select name="discount_quick_keys" id="discount_quick_keys" class="select2" style="width:250px" multiple>
      <?php for($i=1; $i<=100; $i++): ?>
        <option value="<?php echo $i;?>"><?php echo $i;?>%</option>
      <?php endfor; ?>
      </select>
    </td>
  </tr>

</table>

<h3><?php /* translators: woocommerce */ _e( 'Shipping Options', 'woocommerce' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="shipping.name"><?php /* translators: woocommerce */ _e( 'Shipping Name', 'woocommerce' ) ?></label>
    </th>
    <td>
      <input type="text" name="shipping.name" id="shipping.name" placeholder="<?php /* translators: woocommerce */ _e( 'Shipping', 'woocommerce' ) ?>" style="width:250px" />
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="shipping.method"><?php /* translators: woocommerce */ _e( 'Shipping Method', 'woocommerce' ) ?></label>
    </th>
    <td>
      <select name="shipping.method" id="shipping.method">
        <?php foreach( Params::shipping_labels() as $slug => $label ): ?>
          <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select>
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="shipping.taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ) ?></label>
    </th>
    <td>
      <input type="checkbox" name="shipping.taxable" id="shipping.taxable" />
      <select name="shipping.tax_class" id="shipping.tax_class">
        <?php foreach( Tax::tax_classes() as $slug => $label ): ?>
          <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select>
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="shipping.price">
        <?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ) ?>
        (<?php echo get_woocommerce_currency_symbol( get_woocommerce_currency() ); ?>)
      </label>
    </th>
    <td>
      <input type="text" name="shipping.price" id="shipping.price" placeholder="0" style="width:70px" />
    </td>
  </tr>

</table>

<h3><?php _e( 'Fee Options', 'woocommerce-pos' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="fee.name"><?php /* translators: woocommerce */ _e( 'Fee Name', 'woocommerce' ) ?></label>
    </th>
    <td>
      <input type="text" name="fee.name" id="fee.name" placeholder="<?php /* translators: woocommerce */ _e( 'Fee', 'woocommerce' ) ?>" style="width:250px" />
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="shipping.taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ) ?></label>
    </th>
    <td>
      <input type="checkbox" name="fee.taxable" id="fee.taxable" />
      <select name="fee.tax_class" id="fee.tax_class">
        <?php foreach( Tax::tax_classes() as $slug => $label ): ?>
          <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select>
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="fee.price">
        <?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ) ?>
        (<?php echo get_woocommerce_currency_symbol( get_woocommerce_currency() ); ?>)
      </label>
    </th>
    <td>
      <input type="text" name="fee.price" id="fee.price" placeholder="0" style="width:70px" />
    </td>
  </tr>

</table>