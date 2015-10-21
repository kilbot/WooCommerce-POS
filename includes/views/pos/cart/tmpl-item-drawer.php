{{#if product_id}}
<div class="list-row">
  <div><label for="regular_price"><?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>:</label></div>
  <div>
    <input name="regular_price" id="regular_price" class="form-control autogrow" type="text" data-numpad="amount" data-label="<?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>" />
  </div>
</div>

{{/if}}

{{#is type 'shipping'}}
<div class="list-row">
  <div><label for="method_id"><?php /* translators: woocommerce */ _e( 'Shipping Method', 'woocommerce' ); ?>:</label></div>
  <div>
    <select name="method_id" id="method_id"></select>
  </div>
</div>
{{/is}}

<div class="list-row">
  <div><label for="taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ); ?>:</label></div>
  <div>
    <input type="checkbox" name="taxable" id="taxable">
    <select name="tax_class" id="tax_class" {{#unless taxable}}disabled{{/unless}}></select>
  </div>
</div>

{{#if product_id}}
<div class="list-row">
  <div><?php /* translators: woocommerce */ _e( 'Add&nbsp;meta', 'woocommerce' ); ?>:</div>
  <div>
    {{#each meta}}
      <span data-key="{{key}}">
        <input name="meta.label" value="{{label}}" type="text" class="form-control">
        <textarea name="meta.value" class="form-control">{{value}}</textarea>
        <a href="#" class="btn btn-danger btn-circle btn-circle-sm" data-action="remove-meta"><i class="icon-times"></i></a>
      </span>
    {{/each}}
    <a href="#" class="btn btn-success btn-circle btn-circle-sm" data-action="add-meta"><i class="icon-plus"></i></a>
  </div>
</div>
{{/if}}