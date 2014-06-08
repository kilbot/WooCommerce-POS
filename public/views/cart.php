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

<script type="text/x-handlebars-template" id="tmpl-cart-item">
	<td class="qty"><input type="number" value="{{qty}}" size="10" step="any" data-id="qty"></td>
	<td class="name">
		{{title}}
		{{#with attributes}}
			<dl>
			{{#each this}}
				<dt>{{name}}:</dt>
				<dd>{{option}}</dd>
			{{/each}}
			</dl>
		{{/with}}
	</td>
	<td class="price"><input type="type" value="{{{number display_price}}}" size="10" data-id="price" data-precise="{{item_price}}"></td>
	<td class="total">
		{{#if discounted}}
			<del>{{{money display_total}}}</del>
			<ins>{{{money discounted}}}</ins>
		{{else}}
			{{{money display_total}}}
		{{/if}}
	</td>
	<td class="remove"><a class="btn btn-circle btn-danger" href="#"><i class="fa fa-times"></i></a></td>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-total">
	<tr>
		<th colspan="3"><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money subtotal}}}</td>
	</tr>
	{{#if show_cart_discount}}
	<tr>
		<th colspan="3"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money cart_discount negative=true}}}</td>
	</tr>
	{{/if}}
	{{#if show_tax}}
		{{#if show_itemized}}
			{{#each itemized_tax}}
				<tr>
					<th colspan="3">{{@key}}:</th>
					<td colspan="2">{{{money this}}}</td>
				</tr>
			{{/each}}
		{{else}}
			<tr>
				<th colspan="3"><?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:</th>
				<td colspan="2">{{{money tax}}}</td>
			</tr>
		{{/if}}
	{{/if}}
	
	<tr class="order-discount" {{#unless show_order_discount}}style="display:none"{{/unless}}>
		<th colspan="3"><?php _e( 'Order Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2" data-value="{{number order_discount}}">{{{money order_discount negative=true}}}</td>
	</tr>
	<tr>
		<th colspan="3"><?php _e( 'Order Total', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money total}}}</td>
	</tr>
	<tr class="actions">
		<td colspan="5">
			<button class="btn btn-danger action-void alignleft">
				<?php _e( 'Void', 'woocommerce-pos' ); ?> 
			</button>
			<button class="btn btn-primary action-note action-hi">
				<?php _e( 'Note', 'woocommerce-pos' ); ?> 
			</button>
			<button class="btn btn-primary action-discount">
				<?php _e( 'Discount', 'woocommerce-pos' ); ?> 
			</button>
			<button type="submit" class="btn btn-success action-checkout">
				<?php _e( 'Checkout', 'woocommerce-pos' ); ?> 
			</button>
		</td>
	</tr>
	<tr class="note" {{#unless note}}style="display:none"{{/unless}}>
		<td colspan="5">{{note}}</td>
	</tr>
</script>