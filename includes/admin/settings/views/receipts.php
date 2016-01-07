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
      <label for="order_status"><?php _e( 'Receipt Printing', 'woocommerce-pos' ); ?> (<?php _e( 'Experimental', 'woocommerce-pos' ); ?>)</label>
      <img title="<?php esc_attr_e( 'Blah blah', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="wc_pos-tooltip">
    </th>
    <td>
      <select name="print_method" id="print_method">
        <option value="html">HTML via Browser</option>
        <option value="qz-tray">HTML via QZ Tray</option>
        <option value="epos-xml">ePOS/XML via network printer</option>
        <option value="esc-pos">ESC/POS via network printer</option>
      </select>
    </td>
  </tr>

  <tr>
    <th scope="row">
      <label for="customer_roles"><?php _e( 'Receipt Template', 'woocommerce-pos' ) ?></label>
    </th>
    <td>
      <p>
        <?php
          $template_path = 'yadda yadda';
          printf( __( '<strong class="red">Template path:</strong> %s', 'woocommerce-pos' ), '<code style="font-size: 11px">'. $template_path .'</code>' );
        ?>
      </p>
      <a href="#" class="button" data-action="preview-receipt">
        <?php _e( 'View Sample Receipt', 'woocommerce-pos' ); ?>
      </a>
    </td>
  </tr>

  <tr>
    <td colspan="2" id="receipt-preview" style="display:none;"></td>
  </tr>

</table>