<script type="text/template" id="tmpl-order">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h4><?php _e( 'Order', 'woocommerce-pos' ); ?> #<%= order_id %></h4>
			</div>
			<table>
				<thead>
					<tr>
						<th><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
						<th><?php _e( 'Qty', 'woocommerce-pos' ); ?></th>
						<th><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
					</tr>
				</thead>
				<tbody>
				<% _(cart).each(function(item) { %>
					<tr>
						<td class="name">
							<%= item.title %>
							<%= typeof(variation_html) !== 'undefined' ? variation_html : '' %>
						</td>
						<td class="qty"><%= item.qty %></td>
						<td class="total"><%= item.display_total %></td>
					</tr>
				<% }); %>
				</tbody>
				<tfoot>

				</tfoot>
			</table>
			<div class="modal-footer">
				<button id="export" type="button" class="btn"><?php _e( 'Export to PDF', 'woocommerce-pos' ); ?></button>
				<button id="print" type="button" class="btn"><?php _e( 'Print', 'woocommerce-pos' ); ?></button>
				<button id="close" type="button" class="btn btn-primary"><?php _e( 'New Order', 'woocommerce-pos' ); ?></button>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</script>

<script type="text/template" id="tmpl-order-total">
	<tr>
		<th colspan="2"><?php _e( 'Subtotal', 'woocommerce-pos' ); ?>:</th>
		<td colspan="1"><%= subtotal %></td>
	</tr>
	<% if( show_discount ) { %>
	<tr>
		<th colspan="2"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="1"><%= cart_discount %></td>
	</tr>
	<% } %>
	<% if( show_tax ) { %>
		<% if( show_itemized) { _.each(itemized_tax, function(tax, label) { %>
			<tr>
				<th colspan="2"><%= label %>:</th>
				<td colspan="1"><%= tax %></td>
			</tr>
		<% }); } else { %>
			<tr>
				<th colspan="2"><?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:</th>
				<td colspan="1"><%= tax %></td>
			</tr>
		<% } %>
	<% } %>
	<tr>
		<th colspan="2"><?php _e( 'Total', 'woocommerce-pos' ); ?>:</th>
		<td colspan="1"><%= total %></td>
	</tr>
	<% if( typeof total_mismatch !== 'undefined' && total_mismatch ) { %>
	<tr>
		<td colspan="3">
			<div class="alert alert-danger textcenter">
			<i class="fa fa-warning"></i> 
			<strong><?php _e( 'Total mismatch!', 'woocommerce-pos' ); ?></strong>
			<?php _e( 'The total calculated at the POS is different to the total calculated by WooCommerce.', 'woocommerce-pos' ); ?>
			<?php _e( 'Please report this problem to <a href="mailto:support@woopos.com.au?subject=Total mismatch">support</a> so we can look into it.', 'woocommerce-pos' ); ?>
			</div>
		</td>
	</tr>
	<% } %>
</script>