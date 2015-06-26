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
{{#if product}}
	<div class="qty"><input type="text" name="quantity" data-label="<?php /* translators: woocommerce */ _e( 'Quantity', 'woocommerce' ); ?>" data-numpad="quantity" class="btn autogrow"></div>
  <div class="title">
    <strong data-name="title" contenteditable="true">{{title}}</strong>
    {{#is type 'variation'}}
    <dl class="variant">
      {{#each attributes}}
      <dt>{{name}}:</dt>
      <dd>{{label}}</dd>
      {{/each}}
    </dl>
    {{/is}}
		<a data-action="more" href="#" class="btn btn-default btn-circle-sm"><i class="icon-angle-down"></i></a>
	</div>
	<div class="price"><input type="text" name="item_price" data-label="<?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?>" data-numpad="discount" data-original="regular_price" data-percentage="off" class="btn autogrow"></div>
{{else}}
  <div class="qty"></div>
  <div class="title">
    {{#if method_title}}
    <strong data-name="method_title" contenteditable="true">{{method_title}}</strong>
    {{else}}
    <strong data-name="title" contenteditable="true">{{title}}</strong>
    {{/if}}
    <a data-action="more" href="#" class="btn btn-default btn-circle-sm"><i class="icon-angle-down"></i></a>
  </div>
  <div class="price"><input type="text" name="item_price" data-label="<?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?>" data-numpad="amount" class="btn autogrow"></div>
{{/if}}
  <div class="total"></div>
	<div class="action"><a data-action="remove" class="btn btn-circle btn-danger" href="#"><i class="icon-times icon-lg"></i></a></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-item-drawer">

	{{#if product_id}}
	<div class="col-1"><label for="regular_price"><?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>:</label></div>
	<div class="col-2">
		<input name="regular_price" id="regular_price" class="autogrow btn" type="text" data-numpad="amount" data-label="<?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>" />
	</div>
	{{/if}}

	{{#is type 'shipping'}}
	<div class="col-1"><label for="method_id"><?php /* translators: woocommerce */ _e( 'Shipping Method', 'woocommerce' ); ?>:</label></div>
	<div class="col-2">
		<select name="method_id" id="method_id"></select>
	</div>
	{{/is}}

	<div class="col-1"><label for="taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ); ?>:</label></div>
	<div class="col-2">
		<input type="checkbox" name="taxable" id="taxable">
		<select name="tax_class" id="tax_class" {{#unless taxable}}disabled{{/unless}}></select>
	</div>

	{{#if product_id}}
	<div class="col-1"><?php /* translators: woocommerce */ _e( 'Add&nbsp;meta', 'woocommerce' ); ?>:</div>
	<div class="col-2">
		{{#each meta}}
		<span data-key="{{key}}">
			<input name="meta.label" value="{{label}}" type="text">
			<textarea name="meta.value">{{value}}</textarea>
			<a href="#" class="action-remove-meta"><i class="icon-times"></i></a>
		</span>
		{{/each}}
		<a href="#" class="action-add-meta"><i class="icon-plus"></i></a>
	</div>
	{{/if}}

</script>

<script type="text/x-handlebars-template" id="tmpl-cart-totals">
	<li class="subtotal">
		<div><?php /* translators: woocommerce */ _e( 'Cart Subtotal', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money subtotal}}}</div>
		<div class="action"></div>
	</li>
	{{#if has_discount}}
	<li class="cart-discount">
		<div><?php /* translators: woocommerce */ _e( 'Discount', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money cart_discount negative=true}}}</div>
		<div class="action"></div>
	</li>
	{{/if}}
	{{#compare total_tax '!==' 0}}
	{{#if itemized}}
		{{#each tax_lines}}
      {{#compare total '!==' 0}}
			<li class="tax">
				<div>
					{{#if ../../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
					{{label}}:
				</div>
				<div class="total">{{{money total}}}</div>
				<div class="action"></div>
			</li>
      {{/compare}}
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
	<li class="order-total">
		<div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money total}}}</div>
		<div class="action"></div>
	</li>
</script>