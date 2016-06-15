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
      <label for="print_method"><?php _e( 'Default Print Method', 'woocommerce-pos' ); ?> (<?php _e( 'Experimental', 'woocommerce-pos' ); ?>)</label>
    </th>
    <td>
      <select name="print_method" id="print_method">
        <option value="browser">Browser</option>
        <option value="network">Network</option>
        <option value="qz-tray">QZ Tray</option>
      </select>
      <input id="network_printer_address" name="network_printer_address" type="text" placeholder="e.g.: http://192.168.192.168/cgi-bin/epos/service.cgi">
      <a id="qz_tray_options" class="button" href="https://demo.qz.io/" target="_blank">Open QZ Tray Demo</a>
      <p>
        <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/receipts/print-method' ); ?>
      </p>
    </td>
  </tr>

  <tr class="print_receipt_method">
    <th scope="row">
      <label for="template_language"><?php _e( 'Default Receipt Template Language', 'woocommerce-pos' ); ?> (<?php _e( 'Experimental', 'woocommerce-pos' ); ?>)</label>
    </th>
    <td>
      <select name="template_language" id="template_language">
        <option value="html">HTML</option>
        <option value="epos-print">ePOS Print</option>
        <option value="escp">ESC/POS</option>
      </select>
      <p>
        <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/receipts/template-language' ); ?>
      </p>
    </td>
  </tr>

</table>