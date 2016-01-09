<?php
  /**
   * Template for the receipts settings
   */
?>

<h3><?php _e( 'Receipt Options', 'woocommerce-pos' ); ?></h3>

<table class="wc_pos-form-table">

  <tr class="receipt_printing">
    <th scope="row">
      <?php _e( 'Receipt Printing', 'woocommerce-pos' ); ?>
    </th>
    <td>
      <input type="checkbox" name="auto_print_receipt" id="auto_print_receipt" />
      <label for="auto_print_receipt"><?php _e( 'Automatically print receipt after checkout', 'woocommerce-pos' ); ?></label>
    </td>
  </tr>

  <tr class="print_receipt_method">
    <th scope="row">
      <label for="order_status"><?php _e( 'Print Method', 'woocommerce-pos' ); ?> (<?php _e( 'Experimental', 'woocommerce-pos' ); ?>)</label>
      <img title="<?php esc_attr_e( 'Blah blah', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="wc_pos-tooltip">
    </th>
    <td>
      <select name="print_method" id="print_method">
        <option value="html">HTML via Browser</option>
        <optgroup label="Network Printer">
          <option value="ip-html">HTML via IP</option>
          <option value="ip-xml">ePOS/XML via IP</option>
          <option value="ip-esc">ESC/POS via IP</option>
        </optgroup>
        <optgroup label="QZ Tray">
          <option value="qz-tray-html">HTML via QZ Tray</option>
          <option value="qz-tray-xml">ePOS/XML via QZ Tray</option>
          <option value="qz-tray-esc">ESC/POS via QZ Tray</option>
        </optgroup>
      </select>
      <p>
        <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/receipts/print-method' ); ?>
      </p>
    </td>
  </tr>
</table>