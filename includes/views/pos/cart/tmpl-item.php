{{#if product}}
<div class="qty"><input type="text" name="quantity" data-label="<?php /* translators: woocommerce */ _e( 'Quantity', 'woocommerce' ); ?>" data-numpad="quantity" class="form-control autogrow"></div>
<div class="title">
  <strong data-name="title" contenteditable="true">{{title}}</strong>
  <dl class="meta"></dl>
  <a data-action="more" href="#" class="btn btn-default btn-circle-sm"><i class="icon-angle-down"></i></a>
</div>
<div class="price"><input type="text" name="item_price" data-label="<?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?>" data-numpad="discount" data-original="regular_price" data-percentage="off" class="form-control autogrow"></div>
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
<div class="price"><input type="text" name="item_price" data-label="<?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?>" data-numpad="amount" class="form-control autogrow"></div>
{{/if}}
<div class="total"></div>
<div class="action"><a data-action="remove" class="btn btn-circle btn-danger" href="#"><i class="icon-times icon-lg"></i></a></div>