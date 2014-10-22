<?php
/**
 * Template for the general settings
 */
?>

<script id='tmpl-wc-pos-settings-general' type='text/html'>

	<h3 id="general" data="pos-settings-section"><?= __( 'General Options', 'woocommerce-pos' ); ?></h3>
	<table class="form-table">
		<tr valign="top">
			<th scope="row">
				<label for="">Example:</label>
			</th>
			<td>
				<input name="wc_pos_settings_general[example]" type="text" />
			</td>
		</tr>
		<tr valign="top">
			<th scope="row">
				<?= __( 'Grant POS Access', 'woocommerce-pos' ); ?>
			</th>
			<td>
				multiselect goes here
			</td>
		</tr>
	</table>
	<input name="save" class="button-primary" type="submit" value="<?= __( 'Save changes', 'woocommerce-pos' ); ?>" />
	<?php wp_nonce_field( 'woocommerce-pos-settings' ); ?>

</script>