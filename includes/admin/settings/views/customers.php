<?php
/**
 * Template for the general settings
 */
?>

<h3><?php _e( 'Customer Options', 'woocommerce-pos' ); ?></h3>

<table class="wc_pos-form-table">

	<tr class="default_customer">
		<th scope="row">
			<label><?php _e( 'Default POS Customer', 'woocommerce-pos' ); ?></label>
			<img
				title="<?php esc_attr_e( 'The default customer for POS orders, eg: Guest, Walk-in Customer or cashier\'s account.', 'woocommerce-pos' ) ?>"
				src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16"
				data-toggle="wc_pos-tooltip">
		</th>
		<td>
			<select name="default_customer" id="default_customer" class="select2" style="width:250px"
			        data-select="customer"></select>&nbsp;
			<input type="checkbox" name="logged_in_user" id="logged_in_user">
			<label
				for="logged_in_user"><?php _ex( 'Use cashier account', 'Default customer setting', 'woocommerce-pos' ) ?></label>
		</td>
	</tr>

	<?php
	// WordPress 4.4 allows role__in and role__not_in
	global $wp_version;
	if ( version_compare( $wp_version, '4.4', '>=' ) ):
		?>
		<tr>
			<th scope="row">
				<label for="customer_roles"><?php _e( 'Customer Roles', 'woocommerce-pos' ) ?></label>
				<img
					title="<?php esc_attr_e( 'Select which user roles are available as POS customers', 'woocommerce-pos' ) ?>"
					src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16"
					data-toggle="wc_pos-tooltip">
			</th>
			<td>
				<select name="customer_roles" id="customer_roles" class="select2" style="width:250px" multiple>
					<option value="all"><?php /* translators: woocommerce */
						_e( 'All', 'woocommerce' ); ?></option>
					<?php
					global $wp_roles;
					$roles = $wp_roles->roles;
					if ( $roles ): foreach ( $roles as $slug => $role ):
						$label = isset( $role['name'] ) ? $role['name'] : '';
						echo '<option value="' . $slug . '">' . $label . '</option>';
					endforeach; endif;
					?>
				</select>
			</td>
		</tr>
	<?php endif; ?>

</table>
