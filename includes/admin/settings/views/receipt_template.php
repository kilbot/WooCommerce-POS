<?php
  /**
   * Template for the receipts settings
   */
?>

<h3><?php _e( 'Receipt Template', 'woocommerce-pos' ); ?></h3>

<div class="wc_pos-receipt-template-display">

  <div class="wc_pos-settings-panel wc_pos-receipt-template-editor">
    <div class="wc_pos-settings-panel-header">
      <h4><?php /* translators: wordpress */ _e('Code'); ?></h4>
    </div>
    <div class="wc_pos-settings-panel-body">
      <div id="wc_pos-ace-editor"></div>
    </div>
    <div class="wc_pos-settings-panel-footer"></div>
  </div>

  <div class="wc_pos-settings-panel wc_pos-receipt-template-preview">
    <div class="wc_pos-settings-panel-header">
      <h4><?php /* translators: wordpress */ _e('Preview'); ?></h4>
    </div>
    <div class="wc_pos-settings-panel-body"></div>
    <div class="wc_pos-settings-panel-footer"></div>
  </div>

</div>