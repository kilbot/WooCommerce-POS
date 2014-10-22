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
	<form id="wc-pos-settings"></form>
	<?php foreach( $settings as $setting ): ?>
		<?= $setting->output(); ?>
	<?php endforeach; ?>
</div>