<?php 
/**
 * Template for the cart
 */
?>

<div id="cart">
	<table cellspacing="0">
		<thead>
			<tr>
				<th><?php _e( 'Qty', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Total', 'woocommerce-pos' ); ?></th>
				<th>&nbsp;</th>
			</tr>
		</thead>
		<tbody id="cart-items" class="empty">
			<tr>
				<td colspan="5"><?php _e( 'Cart is empty', 'woocommerce-pos' ); ?></td>
			</tr>
		</tbody>
		<tfoot id="cart-totals"></tfoot>
	</table>
</div>

<script type="text/template" id="tmpl-cart-item">
	<td class="qty"><input type="number" value="<%= qty %>" size="10" step="any" data-id="qty"></td>
	<td class="name">
		<%= title %>
		<%= typeof(variation_html) !== 'undefined' ? variation_html : '' %>
	</td>
	<td class="price"><input type="number" value="<%= display_price %>" size="10" step="any" data-id="price" data-precise="<%= item_price %>"></td>
	<td class="total">
		<% if( total_discount !== 0 ) { %>
			<del><%= display_total %></del>
			<ins><%= discounted %></ins>
		<% } else { %>
			<%= display_total %>
		<% } %>
	</td>
	<td class="remove"><a class="btn btn-circle btn-danger" href="#"><i class="fa fa-times"></i></a></td>
</script>

<script type="text/template" id="tmpl-cart-total">
	<tr>
		<th colspan="3"><?php _e( 'Subtotal', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2"><%= subtotal %></td>
	</tr>
	<% if( show_discount ) { %>
	<tr>
		<th colspan="3"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2"><%= cart_discount %></td>
	</tr>
	<% } %>
	<% if( show_tax ) { %>
		<% if( show_itemized) { _.each(itemized_tax, function(tax, label) { %>
			<tr>
				<th colspan="3"><%= label %>:</th>
				<td colspan="2"><%= tax %></td>
			</tr>
		<% }); } else { %>
			<tr>
				<th colspan="3"><?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:</th>
				<td colspan="2"><%= tax %></td>
			</tr>
		<% } %>
	<% } %>
	<tr>
		<th colspan="3"><?php _e( 'Total', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2"><%= total %></td>
	</tr>
	<tr class="actions">
		<td colspan="5">
			<button type="submit" class="btn btn-success btn-checkout" name="pos_checkout" id="pos_checkout" value="checkout">
				<?php _e( 'Checkout', 'woocommerce-pos' ); ?> 
			</button>
		</td>
	</tr>
</script>