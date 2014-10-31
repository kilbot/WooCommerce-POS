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
	<div id="wc-pos-settings" class="wc-pos-settings">
		<p><?= __( 'There has been an error loading the settings, please contact <a href="mailto:support@woopos.com.au">support</a>', 'woocommerce-pos' ); ?></p>
	</div>
	<?php foreach( $settings as $setting ): ?>
		<script type="text/javascript">
			var POS = (function(App) {
				if( typeof App.bootstrap === 'undefined' ) App.bootstrap = [];
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
		<h1><%= title %></h1>
		<i class="dashicons dashicons-no-alt close"></i>
	</div>

	<form class="modal-body">
		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="title"><?= __( 'Title', 'woocommerce-pos' ); ?></label>
					<img data-toggle="tooltip" title="<?= __( 'Payment method title.', 'woocommerce-pos' ); ?>" src="<?= esc_url( WC()->plugin_url() ); ?>/assets/images/help.png" height="16" width="16" />
				</th>
				<td><input name="title" type="text" /></td>
			</tr>
			<tr>
				<th scope="row">
					<label for="description"><?= __( 'Description', 'woocommerce-pos' ); ?></label>
					<img data-toggle="tooltip" title="<?= __( 'Payment method description that will be shown in the POS.', 'woocommerce-pos' ); ?>" src="<?= esc_url( WC()->plugin_url() ); ?>/assets/images/help.png" height="16" width="16" />
				</th>
				<td><textarea name="description"></textarea></td>
			</tr>
			<tr>
				<th scope="row">
					<label for="icon"><?= __( 'Icon', 'woocommerce-pos' ); ?></label>
				</th>
				<td>
					<input name="icon" type="checkbox" />
					<?= _x( 'Show payment gateway icon.', 'POS checkout settings', 'woocommerce-pos' ); ?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="card-reader"><?= __( 'Card Reader', 'woocommerce-pos' ); ?></label>
				</th>
				<td>
					<input name="card-reader" type="checkbox" />
					<?= _x( 'Enable card reader input field.', 'POS checkout settings', 'woocommerce-pos' ); ?><br />
					<em><?= sprintf( __( 'Please <a href="%s" target="_blank">read the docs</a> for more information on card readers.', 'woocommerce-pos' ), 'http://woopos.com.au/docs/card-readers/' ); ?></em>
				</td>
			</tr>
		</table>
	</form>

	<div class="modal-footer">
		<p class="response"></p>
		<button type="button" class="button-primary save"><?= __( 'Save changes', 'woocommerce-pos' ); ?></button>
	</div>
</script>