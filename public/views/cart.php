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
	<td class="qty"><input type="text" value="{{number qty precision='auto'}}" size="10" step="any" data-id="qty" data-title="<?php _e( 'Quantity', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="quantity" class="autogrow"></td>
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
	<td class="price"><input type="text" value="{{number item_price}}" size="10" data-id="item_price" data-original="{{regular_price}}" data-title="<?php _e( 'Item Price', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="item_price" class="autogrow"></td>
	<td class="total">
		{{#if show_line_discount}}
			<del>{{{money line_subtotal}}}</del>
			<ins>{{{money line_total}}}</ins>
		{{else}}
			{{{money line_total}}}
		{{/if}}
	</td>
	<td><a class="btn btn-circle btn-danger action-remove" href="#"><i class="icon icon-times"></i></a></td>
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
					<th colspan="3">
						{{#if ../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
						{{label}}:
					</th>
					<td colspan="2">{{{money total}}}</td>
				</tr>
			{{/each}}
		{{else}}
			<tr class="tax">
				<th colspan="3">
					{{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
					<?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
				</th>
				<td colspan="2">{{{money total_tax}}}</td>
			</tr>
		{{/if}}
	{{/if}}
	<tr class="order-discount" {{#unless show_order_discount}}style="display:none"{{/unless}}>
		<th colspan="3"><?php _e( 'Order Discount', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">
			<input type="text" value="{{number order_discount}}" size="10" data-id="order_discount" data-original="{{original}}" data-title="<?php _e( 'Discount', 'woocommerce-pos' ); ?>" data-placement="left" data-numpad="discount" class="autogrow">
			<span class="amount">{{{money order_discount negative=true}}}</span>
		</td>
	</tr>
	<tr class="order-total">
		<th colspan="3"><?php _e( 'Order Total', 'woocommerce-pos' ); ?>:</th>
		<td colspan="2">{{{money total}}}</td>
	</tr>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-customer">
	<?php _e( 'Customer', 'woocommerce-pos' ); ?>:
	<input type="hidden" id="select-customer" class="select2" style="width:200px" value="{{ customer_id }}" data-customer="{{ customer_name }}" data-nonce="<?= wp_create_nonce( 'json-search-customers' ) ?>">
  <BR>OR <form class="form-inline"><?php _e( 'Add new', 'woocommerce-pos' ); ?>: <input type="text" id="add-customer-name" class="form-control" placeholder="Name"><input type="email" id="add-customer-email" class="form-control" placeholder="Email"><a class="btn btn-primary action-add-customer" href="#" id="add-customer"><?php _e( 'Add', 'woocommerce-pos' ); ?></a></form>
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
