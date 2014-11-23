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
	<h2 id="wc-pos-settings-tabs" class="nav-tab-wrapper">
		<?php foreach( $settings as $setting ): ?>
			<a href="#" class="nav-tab" data-tab="<?php echo $setting->id ?>"><?php echo $setting->label ?></a>
		<?php endforeach; ?>
	</h2>
	<div id="wc-pos-settings" class="wc-pos-settings">
		<p><?php _e( 'There has been an error loading the settings, please contact <a href="mailto:support@woopos.com.au">support</a>', 'woocommerce-pos' ); ?></p>
	</div>
	<?php foreach( $settings as $setting ): ?>
		<?php echo $setting->output(); ?>
	<?php endforeach; ?>
</div>
<div id="wc-pos-modal"></div>