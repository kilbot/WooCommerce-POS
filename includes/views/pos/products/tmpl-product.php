<div class="img">{{#if featured_src}}<img src="{{featured_src}}" title="#{{id}}">{{/if}}</div>
<div class="title">
  <strong>{{title}}</strong>&nbsp;
  {{#with product_attributes}}
  <i class="icon-info-circle" data-toggle="tooltip" title="
    <dl>
      {{#each this}}
      <dt>{{name}}:</dt>
      <dd>{{#list options ', '}}{{this}}{{/list}}</dd>
      {{/each}}
    </dl>
    "></i>
  {{/with}}
  {{#with product_variations}}
  <ul class="variations">
    {{#each this}}
    <li data-toggle="buttons">
      <strong>{{name}}:</strong> {{#list options ', '}}<a href="#" data-name="{{../name}}">{{this}}</a>{{/list}}
    </li>
    {{/each}}
  </ul>
  <small>
    <a href="#" data-action="expand" class="expand-all"><?php /* translators: woocommerce */ _e( 'Expand', 'woocommerce' ); ?></a>
    <a href="#" data-action="close" class="close-all"><?php /* translators: woocommerce */ _e( 'Close', 'woocommerce' ); ?></a>
  </small>
  {{/with}}
  {{#is type 'variation'}}
  <ul class="variant">
    {{#each attributes}}
    <li>
      <strong>{{name}}:</strong> {{#list option ', '}}{{this}}{{/list}}
    </li>
    {{/each}}
  </ul>
  {{/is}}
  {{#if managing_stock}}
  <small><?php /* translators: woocommerce */ printf( __( '%s in stock', 'woocommerce' ), '{{number stock_quantity precision="auto"}}' ); ?></small>
  {{/if}}
</div>
<div class="price">
  {{#if on_sale}}<del>{{#list regular_price ' - '}}{{{money this}}}{{/list}}</del>{{/if}} {{#list price ' - '}}{{{money this}}}{{/list}}
</div>
{{#is type 'variable'}}
<div class="action">
  <a data-action="variations" href="#">
    <i class="icon-chevron-circle-right"></i>
  </a>
</div>
{{else}}
<div class="action">
  <a data-action="add" href="#">
    <i class="icon-plus-circle"></i>
  </a>
</div>
{{/is}}