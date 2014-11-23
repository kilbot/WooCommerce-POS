<?php
/**
 * Template for the general settings
 */
?>
<script id="tmpl-wc-pos-settings-general" type="text/html">

	<h3><?php /* translators: woocommerce */ _e( 'General Options', 'woocommerce' ); ?></h3>

	<table class="form-table">

		<tr>
			<th scope="row"><label for="grant_access"><?php _e( 'Grant POS Access', 'woocommerce-pos' ); ?></label></th>
			<td>
				<select multiple name="grant_access" id="grant_access" class="select2">
					<?php global $wp_roles; if( $roles = $wp_roles->roles ): foreach( $roles as $slug => $role ):  ?>
						<option value="<?php echo $slug ?>"><?php echo $role['name'] ?></option>
					<?php endforeach; endif; ?>
				</select>
			</td>
		</tr>

		<tr>
			<th scope="row">
				<label for="enable_pos_visibility"><?php _e( 'Product Visibility', 'woocommerce-pos' ) ?>:</label>
			</th>
			<td>
				<input type="checkbox" name="enable_pos_visibility" />
				<?php printf( __( 'Enable product visibility options, eg: <a href="%s">POS Only products</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/pos-only-products/' )?>.
			</td>
		</tr>

		<tr>
			<th scope="row"><label for="select">Select:</label></th>
			<td>
				<select name="select" class="select2">
					<option value="888">Option 1</option>
					<option value="999">Option 2</option>
					<option value="000">Option 3</option>
				</select>
			</td>
		</tr>

	</table>

	<input class="button-primary" type="submit" value="<?php /* translators: wordpress */ echo esc_attr__( 'Save Changes' ); ?>" /><p class="response"></p>
	<input type="hidden" name="id" value="general" />

</script>