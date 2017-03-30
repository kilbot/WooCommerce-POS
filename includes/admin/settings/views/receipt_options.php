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

</table>

<h3><?php _e( 'Experimental Print Options', 'woocommerce-pos' ); ?></h3>
<p>
  <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), wc_pos_doc_url('how-to/configure/receipts.html') ); ?>
</p>

<table class="wc_pos-form-table">

  <tr class="print_receipt_method">
    <th scope="row">
      <label for="print_method"><?php _e( 'Print Method', 'woocommerce-pos' ); ?></label>
    </th>
    <td>
      <select name="print_method" id="print_method">
        <option value="browser"><?php _e( 'Browser', 'woocommerce-pos' ) ?></option>
        <option value="network"><?php _e( 'Network', 'woocommerce-pos' ) ?></option>
        <option value="qz-tray"><?php _e( 'QZ Tray', 'woocommerce-pos' ) ?></option>
        <option value="file"><?php _e( 'Print to file', 'woocommerce-pos' ) ?></option>
      </select>
      <div id="network-options">
        <p>
          <label for="network_options"><?php _e('Printer URL', 'woocommerce-pos'); ?>:</label> <input id="network_options" name="network_options" type="text" style="width:400px">
        </p>
        <p>
          <img src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" style="float:left;margin: 3px 5px 10px 0;">
          <small><?php _e('Example Printer URL for Epson TM Printers', 'woocommerce-pos') ?>: http://192.168.192.168/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000</small>
        </p>
      </div>
      <div id="qz-tray-options">
        <p>
          <a id="qz_tray_options" class="button" href="https://demo.qz.io/" target="_blank">Open QZ Tray Demo</a>
        </p>
      </div>
    </td>
  </tr>

  <tr class="print_receipt_method">
    <th scope="row">
      <label for="template_language"><?php _e( 'Receipt Template Language', 'woocommerce-pos' ); ?></label>
    </th>
    <td>
      <select name="template_language" id="template_language">
        <option value="html"><?php _e( 'HTML', 'woocommerce-pos' ) ?></option>
        <option value="epos-print"><?php _e( 'ePOS Print', 'woocommerce-pos' ) ?></option>
        <option value="escp"><?php _e( 'ESC/POS', 'woocommerce-pos' ) ?></option>
      </select>
    </td>
  </tr>

</table>