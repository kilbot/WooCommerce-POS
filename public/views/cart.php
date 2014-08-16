<?php 
/**
 * Template for the cart
 */
?>

<script type="text/template" id="tmpl-cart-layout">
	<div id="cart"></div>
	<div id="cart-customer" style="display:none"></div>
	<div id="cart-actions" style="display:none"></div>
	<div id="cart-notes" style="display:none"></div>
</script>

<script type="text/template" id="tmpl-cart-items">
	<table class="table">
		<thead>
			<tr>
				<th><?php _e( 'Qty', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Total', 'woocommerce-pos' ); ?></th>
				<th>&nbsp;</th>
			</tr>
		</thead>
		<tbody id="cart-items"></tbody>
		<tfoot id="cart-totals"></tfoot>
	</table>
</script>

<script type="text/template" id="tmpl-cart-empty">
	<td colspan="5"><?php _e( 'Cart is empty', 'woocommerce-pos' ); ?></td>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-item">
	<td class="qty"><input type="number" value="{{qty}}" size="10" step="any" data-id="qty" data-title="<?php _e( 'Quantity', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="quantity" class="autogrow"></td>
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
	<td class="price"><input type="text" value="{{{number display_price}}}" size="10" data-id="price" data-original="{{regular_price}}" data-title="<?php _e( 'Item Price', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="discount" class="autogrow"></td>
	<td class="total">
		{{#if discounted}}
			<del>{{{money display_total}}}</del>
			<ins>{{{money discounted}}}</ins>
		{{else}}
			{{{money display_total}}}
		{{/if}}
	</td>
	<td><a class="btn btn-circle btn-danger action-remove" href="#"><i class="fa fa-times"></i></a></td>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-totals">
	<tr class="subtotal">
		<th colspan="3"><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money subtotal}}}</td>
	</tr>
	{{#if show_cart_discount}}
	<tr class="cart-discount">
		<th colspan="3"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money cart_discount negative=true}}}</td>
	</tr>
	{{/if}}
	{{#if show_tax}}
		{{#if show_itemized}}
			{{#each itemized_tax}}
				<tr class="tax">
					<th colspan="3">{{@key}}:</th>
					<td colspan="2">{{{money this}}}</td>
				</tr>
			{{/each}}
		{{else}}
			<tr class="tax">
				<th colspan="3"><?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:</th>
				<td colspan="2">{{{money tax}}}</td>
			</tr>
		{{/if}}
	{{/if}}
	<tr class="order-discount" {{#unless show_order_discount}}style="display:none"{{/unless}}>
		<th colspan="3"><?php _e( 'Order Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2" data-value="{{number order_discount}}" data-original="{{total}}" data-title="<?php _e( 'Discount', 'woocommerce-pos' ); ?>" data-numpad="discount" data-placement="left">{{{money order_discount negative=true}}}</td>
	</tr>
	<tr class="order-total">
		<th colspan="3"><?php _e( 'Order Total', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money total}}}</td>
	</tr>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-customer">
	<?php _e( 'Customer', 'woocommerce-pos' ); ?>:
	<input type="hidden" id="select-customer" class="select2" style="width:200px" value="{{ customer_id }}" data-customer="{{ customer_name }}" data-nonce="<?= wp_create_nonce( 'json-search-customers' ) ?>">
</script>

<script type="text/template" id="tmpl-cart-actions">
	<button class="btn btn-danger action-void pull-left">
		<?php _e( 'Void', 'woocommerce-pos' ); ?> 
	</button>
	<button class="btn btn-primary action-note">
		<?php _e( 'Note', 'woocommerce-pos' ); ?> 
	</button>
	<button class="btn btn-primary action-discount">
		<?php _e( 'Discount', 'woocommerce-pos' ); ?> 
	</button>
	<button type="submit" class="btn btn-success action-checkout">
		<?php _e( 'Checkout', 'woocommerce-pos' ); ?> 
	</button>
</script>