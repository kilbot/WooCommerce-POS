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
  <p class="wc_pos-css-fade-out-10"><i class="wc_pos-icon-loading"></i> <?php /* translators: wordpress */ _e( 'Loading ...' ); ?></p>
  <p class="wc_pos-css-fade-in-10"><?php _e( 'There has been an error loading the settings, please contact <a href="mailto:support@woopos.com.au">support</a>', 'woocommerce-pos' ); ?></p>
</div>
<script type="text/javascript">var wc_pos_settings = {};</script>

<?php foreach( $this->settings as $setting ): if( $setting->current_user_authorized ): ?>

  <script class="tmpl-wc-pos-settings"
          data-id="<?php echo $setting->id ?>"
          data-label="<?php echo $setting->label ?>"
          type="text/template">
    <?php echo $setting->output(); ?>
  </script>

  <?php $json = $setting->getJSON(); if( $json ) : ?>
    <script type="text/javascript">
      wc_pos_settings['<?php echo $setting->id ?>'] = <?php echo $json; ?>;
    </script>
  <?php endif; ?>

<?php endif; endforeach; ?>