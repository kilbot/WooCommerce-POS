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
	<td class="price"><input type="number" value="<%= price %>" size="10" step="any" data-id="price"></td>
	<td class="total">
		<% if( discount !== 0) { %>
			<del><%= prediscount %></del>
			<ins><%= total %></ins>
		<% } else { %>
			<%= total %>
		<% } %>
	</td>
	<td class="remove"><a class="btn btn-circle btn-flat-caution" href="#"><i class="fa fa-times"></i></a></td>
</script>

<script type="text/template" id="tmpl-cart-total">
	<th colspan="3"><%= label %></th>
	<td colspan="2"><%= total %></td>
</script>

<script type="text/template" id="tmpl-cart-action">
	<tr class="actions">
		<td colspan="5">
			<button type="submit" class="btn btn-flat-action btn-checkout" name="pos_checkout" id="pos_checkout" value="checkout">
				<?php _e( 'Checkout', 'woocommerce-pos' ); ?> 
				<i class="fa fa-chevron-right"></i>
			</button>
		</td>
	</tr>
</script>