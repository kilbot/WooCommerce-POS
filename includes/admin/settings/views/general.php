<?php
/**
 * Template for the general settings
 */
?>

<h3><?php /* translators: woocommerce */ _e( 'General Options', 'woocommerce' ); ?></h3>

<table class="form-table">

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

<a class="button-primary" data-action="save">
	<?php /* translators: wordpress */ echo esc_attr__( 'Save Changes' ); ?>
</a>
<p class="response"></p>