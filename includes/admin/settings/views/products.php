<?php
/**
 * Template for the product settings
 */
?>

<h3><?php /* translators: woocommerce */
	_e( 'Product Options', 'woocommerce' ); ?></h3>

<table class="wc_pos-form-table" id="wc_pos-product-options">

	<tr>
		<th scope="row">
			<label for="pos_only_products"><?php _e( 'Product Visibility', 'woocommerce-pos' ) ?></label>
		</th>
		<td>
			<input type="checkbox" name="pos_only_products" id="pos_only_products"/>
			<?php printf( __( 'Enable <a href="%s">POS Only products</a>', 'woocommerce-pos' ), wcpos_doc_url( 'how-to/configure/products/pos-only-products.html' ) ) ?>
			.
		</td>
	</tr>

	<tr>
		<th scope="row">
			<label for="decimal_qty"><?php _e( 'Allow Decimal Quantity', 'woocommerce-pos' ) ?></label>
			<img
				title="<?php esc_attr_e( 'Allows items to have decimal values in the quantity field, eg: 0.25', 'woocommerce-pos' ) ?>"
				src="<?php echo WC()->plugin_url(); ?>/assets/images/help.png" height="16" width="16"
				data-toggle="wc_pos-tooltip">
		</th>
		<td>
			<input type="checkbox" name="decimal_qty" id="decimal_qty"/>
			<?php /* translators: wordpress */
			_e( 'Enable' ); ?>
		</td>
	</tr>

</table>

<h3><?php _e( 'Product Tabs', 'woocommerce-pos' ); ?></h3>

<div id="wc_pos-product-tabs">
	<table class="widefat wc_pos-form-table-horizontal sortable" cellspacing="0">
		<thead>
		<tr>
			<th>&nbsp;</th>
			<th><?php _e( 'Label', 'woocommerce-pos' ); ?></th>
			<th style="width:100%"><?php _e( 'Filter' ); ?></th>
			<th>&nbsp;</th>
		</tr>
		</thead>
		<tbody>
		<tr>
			<td style="vertical-align:middle;"><span class="dashicons dashicons-menu"></span><input type="hidden"
			                                                                                        data-name="order">
			</td>
			<td><input type="text" data-name="label"></td>
			<td><input style="width:100%" type="text" data-name="filter"></td>
			<td><a class="button-secondary" href="#" data-action="remove-tab"><?php _e( 'Remove' ); ?></a></td>
		</tr>
		</tbody>
		<tfoot>
		<tr>
			<td colspan="4"><a class="button-secondary" href="#"
			                   data-action="add-tab"><?php _e( 'Add Tab', 'woocommerce-pos' ); ?></a></td>
		</tr>
		</tfoot>
	</table>
</div>
