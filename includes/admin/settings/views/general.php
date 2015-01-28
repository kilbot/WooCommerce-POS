<?php
/**
 * Template for the general settings
 */
?>
<script class="tmpl-wc-pos-settings" data-id="<?php echo $this->id ?>" data-label="<?php echo $this->label ?>" type="text/template">

	<h3><?php /* translators: woocommerce */ _e( 'General Options', 'woocommerce' ); ?></h3>

	<table class="form-table">

		<tr>
			<th scope="row">
				<label for="grant_access[]"><?php _e( 'Grant POS Access', 'woocommerce-pos' ); ?></label>
				<img title="<?php _e( 'Select which user roles have access to the POS.', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="tooltip">
			</th>
			<td>
				<select multiple name="grant_access[]" id="grant_access[]" class="select2">
					<?php global $wp_roles; if( $roles = $wp_roles->roles ): foreach( $roles as $slug => $role ):  ?>
						<option value="<?php echo esc_attr( $slug ); ?>"><?php echo esc_html( $role['name'] ); ?></option>
					<?php endforeach; endif; ?>
				</select>
			</td>
		</tr>

		<tr>
			<th scope="row">
				<label for="enable_pos_only_products"><?php _e( 'Product Visibility', 'woocommerce-pos' ) ?></label>
			</th>
			<td>
				<input type="checkbox" name="enable_pos_only_products" id="enable_pos_only_products" />
				<?php printf( __( 'Enable <a href="%s">POS Only products</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/pos-only-products/' )?>.
			</td>
		</tr>

		<tr class="default_customer">
			<th scope="row">
				<label for="default_customer"><?php _e( 'Default POS Customer', 'woocommerce-pos' ); ?></label>
				<img title="<?php _e( 'The default customer for POS orders, eg: Guest or create a new customer.', 'woocommerce-pos' ) ?>" src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16" data-toggle="tooltip">
			</th>
			<td data-component="customer-select"></td>
		</tr>

	</table>

	<input class="button-primary" type="submit" value="<?php /* translators: wordpress */ echo esc_attr__( 'Save Changes' ); ?>" /><p class="response"></p>

</script>