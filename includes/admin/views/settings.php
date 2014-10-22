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
			<a href="#" class="nav-tab" data-tab="<?= $setting->id ?>"><?= $setting->label ?></a>
		<?php endforeach; ?>
	</h2>
	<div id="wc-pos-settings"></div>
	<?php foreach( $settings as $setting ): ?>
		<script id='tmpl-wc-pos-settings-<?= $setting->id ?>' type='text/html'>
			<?= $setting->output(); ?>
			<input class="button-primary" type="submit" value="<?= __( 'Save changes', 'woocommerce-pos' ); ?>" />
			<input type="hidden" name="key" value="<?= $setting->option_key ?>" />
			<?php wp_nonce_field( 'wc-pos-settings', 'security', false ); ?>
		</script>
	<?php endforeach; ?>
</div>