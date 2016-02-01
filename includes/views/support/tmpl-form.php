<li class="list-row">
  <div class="label"><?php /* translators: wordpress */ _e( 'Name' ); ?>:</div>
  <div class="input" data-name="name" contenteditable></div>
</li>
<li class="list-row">
  <div class="label"><?php /* translators: wordpress */ _e( 'Email' ); ?>:</div>
  <div class="input" data-name="email" contenteditable></div>
</li>
<li class="list-row">
  <div class="label"><?php /* translators: wordpress */ _e( 'Message' ); ?>:</div>
  <div class="input" data-name="message" placeholder="<?php _e('Describe your problem here ...', 'woocommerce-pos') ?>" contenteditable></div>
</li>
<li class="list-row no-border">
  <div>
    <label class="c-input c-checkbox small">
      <input type="checkbox" name="append_report">
      <span class="c-indicator"></span>
      <?php _e( 'Append POS system report', 'woocommerce-pos' ); ?>
    </label>
    <a href="#" data-action="toggle"><i class="icon-info-circle"></i></a>
    <textarea class="form-control" name="report" class="small" style="display:none" readonly></textarea>
  </div>
</li>