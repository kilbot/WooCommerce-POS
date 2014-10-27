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
		<?php foreach( self::$settings as $setting ): ?>
			<a href="#" class="nav-tab" data-tab="<?= $setting->id ?>"><?= $setting->label ?></a>
		<?php endforeach; ?>
	</h2>
	<div id="wc-pos-settings">
		<p><?= __( 'There has been an error loading the settings, please contact <a href="mailto:support@woopos.com.au">support</a>', 'woocommerce-pos' ); ?></p>
	</div>
	<?php foreach( self::$settings as $setting ): ?>
		<script type="text/javascript">
			var POS = (function(App) {
				if( !_.isArray( App.bootstrap ) ) App.bootstrap = [];
				App.bootstrap.push( <?= $setting->bootstrap_data() ?> );
				return App;
			})(POS || {});
		</script>
		<script id="tmpl-wc-pos-settings-<?= $setting->id ?>" type="text/html">
			<?= $setting->output(); ?>
			<input class="button-primary" type="submit" value="<?= __( 'Save changes', 'woocommerce-pos' ); ?>" /><p class="response"></p>
			<input type="hidden" name="id" value="<?= $setting->id ?>" />
		</script>
	<?php endforeach; ?>
</div>
<div id="wc-pos-modal"></div>
<script id="tmpl-wc-pos-modal" type="text/html">
	<div class="modal-header">
	<button type="button" class="close" aria-hidden="true">&times;</button>
	<h4 class="modal-title">Confirm Action</h4>
	</div>

	<div class="modal-body">
	<p>Are you sure you want to do this?</p>
	</div>

	<div class="modal-footer">
	<button type="button" class="btn btn-default">Cancel</button>
	<button type="button" class="btn btn-primary">Affirmative</button>
	</div>
</script>