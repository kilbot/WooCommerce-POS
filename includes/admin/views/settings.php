<?php
/**
 * View for the Settings page
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.kilbot.com.au
 */
?>

<div class="wrap">
  <p><?php _e( 'There has been an error loading the settings, please contact <a href="mailto:support@woopos.com.au">support</a>', 'woocommerce-pos' ); ?></p>
</div>

<?php foreach( $this->settings as $setting ): if($setting->current_user_authorized): ?>

  <script class="tmpl-wc-pos-settings"
          data-id="<?php echo $setting->id ?>"
          data-label="<?php echo $setting->label ?>"
          type="text/template">
    <?php echo $setting->output(); ?>
  </script>

  <?php $data = $setting->get_data(); if( $data ): ?>
    <script type="text/javascript">
      var wc_pos_settings = wc_pos_settings || {};
      wc_pos_settings['<?php echo $setting->id ?>'] = <?php echo json_encode($data); ?>
    </script>
  <?php endif; ?>

<?php endif; endforeach; ?>

<script type="text/template" id="tmpl-modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 data-title="<?php /* translators: wordpress */ _e( 'Loading&hellip;' ); ?>"></h1>
        <i class="icon icon-times" data-action="close" title="<?php /* translators: wordpress */ _e( 'Close' ); ?>"></i>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer">
        <p class="response"></p>
        <a href="#" class="button-primary" data-action="save">
          <?php /* translators: woocommerce */ _e( 'Save Changes', 'woocommerce' ); ?>
        </a>
      </div>
    </div>
  </div>
</script>