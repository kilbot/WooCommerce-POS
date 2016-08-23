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
        <option value="browser"><?php _e( 'Browser', 'woocommerce-pos' ) ?></option>
        <option value="network"><?php _e( 'Network', 'woocommerce-pos' ) ?></option>
        <option value="qz-tray"><?php _e( 'QZ Tray', 'woocommerce-pos' ) ?></option>
        <option value="file"><?php _e( 'Print to file', 'woocommerce-pos' ) ?></option>
      </select>
      <div id="network-options">
        <label for="network_options"><?php _e('Network address', 'woocommerce-pos'); ?>:</label> <input id="network_options" name="network_options" type="text" placeholder="e.g.: http://192.168.192.168/cgi-bin/epos/service.cgi" style="width:250px">
      </div>
      <div id="qz-tray-options">
        <a id="qz_tray_options" class="button" href="https://demo.qz.io/" target="_blank">Open QZ Tray Demo</a>
      </div>
      <p>
        <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), wc_pos_doc_url('receipts/print-method.html') ); ?>
      </p>
    </td>
  </tr>

  <tr class="print_receipt_method">
    <th scope="row">
      <label for="template_language"><?php _e( 'Default Receipt Template Language', 'woocommerce-pos' ); ?> (<?php _e( 'Experimental', 'woocommerce-pos' ); ?>)</label>
    </th>
    <td>
      <select name="template_language" id="template_language">
        <option value="html"><?php _e( 'HTML', 'woocommerce-pos' ) ?></option>
        <option value="epos-print"><?php _e( 'ePOS Print', 'woocommerce-pos' ) ?></option>
        <option value="escp"><?php _e( 'ESC/POS', 'woocommerce-pos' ) ?></option>
      </select>
      <p>
        <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), wc_pos_doc_url('receipts/template-language.html') ); ?>
      </p>
    </td>
  </tr>

</table>