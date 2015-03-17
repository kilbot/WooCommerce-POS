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
<script type="text/javascript">var wc_pos_settings = {};</script>

<?php foreach( $this->settings as $setting ): if($setting->current_user_authorized): ?>

  <script class="tmpl-wc-pos-settings"
          data-id="<?php echo $setting->id ?>"
          data-label="<?php echo $setting->label ?>"
          type="text/template">
    <?php echo $setting->output(); ?>
  </script>

  <?php $data = $setting->get_data(); if( isset($data) ): ?>
    <script type="text/javascript">
      wc_pos_settings['<?php echo $setting->id ?>'] = <?php echo wc_pos_json_encode($data); ?>
    </script>
  <?php endif; ?>

<?php endif; endforeach; ?>