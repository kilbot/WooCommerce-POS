<?php
/**
 * Template for the cart
 */
?>

<script type="text/template" id="tmpl-cart">
	<div class="list-header">
		<div class="qty"><?php _ex( 'Qty', 'Abbreviation of Quantity', 'woocommerce-pos' ); ?></div>
		<div class="title"><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></div>
		<div class="price"><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></div>
		<div class="total"><?php /* translators: woocommerce */ _e( 'Total', 'woocommerce' ); ?></div>
		<div class="action">&nbsp;</div>
	</div>
	<div class="list"></div>
	<div class="list-totals"></div>
	<div class="cart-customer"><?php /* translators: woocommerce */ _e( 'Customer', 'woocommerce' ); ?>: </div>
	<div class="list-actions"></div>
	<div class="cart-notes"></div>
	<div class="list-footer"></div>
</script>

<script type="text/template" id="tmpl-cart-empty">
	<div><?php /* translators: woocommerce */ _e( 'Your cart is currently empty.', 'woocommerce' ); ?></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-item">
	<div class="qty"><input type="text" name="qty" data-title="<?php /* translators: woocommerce */ _e( 'Quantity', 'woocommerce' ); ?>" data-numpad="quantity" class="btn autogrow"></div>
	<div class="title">
		<strong class="action-edit-title" contenteditable="true">{{title}}</strong>
		{{#with attributes}}
		<dl>
			{{#each this}}
			<dt>{{name}}:</dt>
			<dd>{{option}}</dd>
			{{/each}}
		</dl>
		{{/with}}
		<a href="#" class="btn btn-default btn-circle-sm action-more"><i class="icon icon-angle-down"></i></a>
	</div>
	<div class="price"><input type="text" name="item_price" data-original="{{regular_price}}" data-title="<?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?>" data-numpad="discount" class="btn autogrow"></div>
	<div class="total"></div>
	<div class="action"><a class="btn btn-circle btn-danger action-remove" href="#"><i class="icon icon-times icon-lg"></i></a></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-item-drawer">

	{{#if id}}
	<div class="col-1"><label for="regular_price"><?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>:</label></div>
	<div class="col-2">
		<input name="regular_price" id="regular_price" class="autogrow btn" type="text" data-numpad="money" data-title="<?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>" />
	</div>
	{{/if}}

	{{#is type 'shipping'}}
	<div class="col-1"><label for="shipping_method"><?php /* translators: woocommerce */ _e( 'Shipping Method', 'woocommerce' ); ?>:</label></div>
	<div class="col-2">
		<select name="shipping_method" id="shipping_method"></select>
	</div>
	{{/is}}

	<div class="col-1"><label for="taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ); ?>:</label></div>
	<div class="col-2">
		<input type="checkbox" name="taxable" id="taxable">
		<select name="tax_class" id="tax_class" {{#unless taxable}}disabled{{/unless}}></select>
	</div>

	{{#if id}}
	<div class="col-1"><?php /* translators: woocommerce */ _e( 'Add&nbsp;meta', 'woocommerce' ); ?>:</div>
	<div class="col-2">
		{{#each meta}}
		<span data-key="{{key}}">
			<input name="meta.label" value="{{label}}" type="text">
			<textarea name="meta.value">{{value}}</textarea>
			<a href="#" class="action-remove-meta"><i class="icon icon-times"></i></a>
		</span>
		{{/each}}
		<a href="#" class="action-add-meta"><i class="icon icon-plus"></i></a>
	</div>
	{{/if}}

</script>

<script type="text/x-handlebars-template" id="tmpl-cart-totals">
	<li class="subtotal">
		<div><?php /* translators: woocommerce */ _e( 'Cart Subtotal', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money subtotal}}}</div>
		<div class="action"></div>
	</li>
	{{#compare cart_discount '!==' 0}}
	<li class="cart-discount">
		<div><?php /* translators: woocommerce */ _e( 'Cart Discount', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money cart_discount negative=true}}}</div>
		<div class="action"></div>
	</li>
	{{/compare}}
	{{#compare total_tax '!==' 0}}
	{{#if show_itemized}}
		{{#each itemized_tax}}
			<li class="tax">
				<div>
					{{#if ../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
					{{label}}:
				</div>
				<div class="total">{{{money total}}}</div>
				<div class="action"></div>
			</li>
		{{/each}}
	{{else}}
		<li class="tax">
			<div>
				{{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
				<?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
			</div>
			<div class="total">{{{money total_tax}}}</div>
			<div class="action"></div>
		</li>
	{{/if}}
	{{/compare}}
	<li class="order-discount" {{#compare order_discount '===' 0}}style="display:none"{{/compare}}>
		<div><?php /* translators: woocommerce-admin */ _e( 'Order Discount', 'woocommerce-admin' ); ?>:</div>
		<div class="total">
			<input type="text" value="{{number order_discount}}" name="order_discount" data-original="{{original}}" data-title="<?php _e( 'Discount', 'woocommerce-pos' ); ?>" data-placement="left" data-numpad="discount" class="autogrow">
			<span class="amount">{{{money order_discount negative=true}}}</span>
		</div>
		<div class="action"></div>
	</li>
	<li class="order-total">
		<div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money total}}}</div>
		<div class="action"></div>
	</li>
</script>

<script type="text/template" id="tmpl-cart-actions">
	<a href="#" class="btn btn-danger pull-left" data-action="void"><?php _e( 'Void', 'woocommerce-pos' ); ?></a>
	<a href="#" class="btn btn-primary" data-action="fee" data-title="<?php /* translators: woocommerce */ _e( 'Fee Name', 'woocommerce' ); ?>"><?php /* translators: woocommerce */ _e( 'Fee', 'woocommerce' ); ?></a>
	<a href="#" class="btn btn-primary" data-action="shipping" data-title="<?php /* translators: woocommerce */ _e( 'Shipping Name', 'woocommerce' ); ?>"><?php /* translators: woocommerce */ _e( 'Shipping', 'woocommerce' ); ?></a>
	<a href="#" class="btn btn-primary" data-action="coupon"><?php /* translators: woocommerce */ _e( 'Coupon', 'woocommerce' ); ?></a>
	<a href="#" class="btn btn-primary" data-action="discount"><?php _e( 'Discount', 'woocommerce-pos' ); ?></a>
	<a href="#" class="btn btn-primary" data-action="note"><?php /* translators: woocommerce */ _e( 'Note', 'woocommerce' ); ?></a>
	<a href="#" class="btn btn-success" data-action="checkout"><?php /* translators: woocommerce */ _e( 'Checkout', 'woocommerce' ); ?></a>
</script>