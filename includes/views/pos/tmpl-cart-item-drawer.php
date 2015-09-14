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