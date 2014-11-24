<?php
/**
 * Template for the cart
 */
?>

<script type="text/template" id="tmpl-cart">
	<div class="list-header">
		<div><?php /* translators: woocommerce */ _ex( 'Qty', 'Abbreviation of Quantity', 'woocommerce-pos' ); ?></div>
		<div><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></div>
		<div><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></div>
		<div><?php /* translators: woocommerce */ _e( 'Total', 'woocommerce' ); ?></div>
		<div>&nbsp;</div>
	</div>
	<div class="list"></div>
	<div class="list-totals"></div>
	<div class="cart-actions"></div>
</script>

<script type="text/template" id="tmpl-cart-empty">
	<div><?php /* translators: woocommerce */ _e( 'Your cart is currently empty.', 'woocommerce' ); ?></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-item">
	<div class="qty"><input type="text" value="{{number qty precision='auto'}}" size="10" step="any" data-id="qty" data-title="<?php _e( 'Quantity', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="quantity" class="autogrow"></div>
	<div class="name">
		{{title}}
		{{#with attributes}}
		<dl>
			{{#each this}}
			<dt>{{name}}:</dt>
			<dd>{{option}}</dd>
			{{/each}}
		</dl>
		{{/with}}
	</div>
	<div class="price"><input type="text" value="{{number item_price}}" size="10" data-id="item_price" data-original="{{regular_price}}" data-title="<?php _e( 'Item Price', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="item_price" class="autogrow"></div>
	<div class="total">
		{{#if show_line_discount}}
		<del>{{{money subtotal}}}</del>
		<ins>{{{money total}}}</ins>
		{{else}}
		{{{money total}}}
		{{/if}}
	</div>
	<div class="action"><a class="btn btn-circle btn-danger action-remove" href="#"><i class="icon icon-times"></i></a></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-totals">
	<li class="subtotal">
		<div><?php /* translators: woocommerce */ _e( 'Cart Subtotal', 'woocommerce' ); ?>:</div>
		<div>{{{money subtotal}}}</div>
	</li>
	{{#if show_cart_discount}}
	<li class="cart-discount">
		<div><?php /* translators: woocommerce */ _e( 'Cart Discount', 'woocommerce' ); ?>:</div>
		<div>{{{money cart_discount negative=true}}}</div>
	</li>
	{{/if}}
	{{#if show_tax}}
	{{#if show_itemized}}
	{{#each itemized_tax}}
	<li class="tax">
		<div>
			{{#if ../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
			{{label}}:
		</div>
		<div>{{{money total}}}</div>
	</li>
	{{/each}}
	{{else}}
	<li class="tax">
		<div>
			{{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
			<?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
		</div>
		<div>{{{money total_tax}}}</div>
	</li>
	{{/if}}
	{{/if}}
	<li class="order-discount" {{#unless show_order_discount}}style="display:none"{{/unless}}>
		<div><?php /* translators: woocommerce-admin */ _e( 'Order Discount', 'woocommerce-admin' ); ?>:</div>
		<div>
			<input type="text" value="{{number order_discount}}" size="10" data-id="order_discount" data-original="{{original}}" data-title="<?php _e( 'Discount', 'woocommerce-pos' ); ?>" data-placement="left" data-numpad="discount" class="autogrow">
			<span class="amount">{{{money order_discount negative=true}}}</span>
		</div>
	</li>
	<li class="order-total">
		<div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
		<div>{{{money total}}}</div>
	</li>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-customer">
	<?php /* translators: woocommerce */ _e( 'Customer', 'woocommerce' ); ?>:
	<input type="hidden" id="select-customer" class="select2" style="width:200px" value="{{ customer_id }}" data-customer="{{ customer_name }}" data-nonce="<?php echo wp_create_nonce( 'json-search-customers' ) ?>">
</script>

<script type="text/template" id="tmpl-cart-actions">
	<button class="btn btn-danger action-void pull-left">
		<?php _e( 'Void', 'woocommerce-pos' ); ?>
	</button>
	<button class="btn btn-primary action-note">
		<?php /* translators: woocommerce */ _e( 'Note', 'woocommerce' ); ?>
	</button>
	<button class="btn btn-primary action-discount">
		<?php _e( 'Discount', 'woocommerce-pos' ); ?>
	</button>
	<button type="submit" class="btn btn-success action-checkout">
		<?php /* translators: woocommerce */ _e( 'Checkout', 'woocommerce' ); ?>
	</button>
</script>