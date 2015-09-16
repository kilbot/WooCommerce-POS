<div class="img"><img src="{{featured_src}}" title="#{{id}}"></div>
<div class="title">
  <strong>{{title}}</strong>
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
  <dl class="variations">
    {{#each this}}
    <dt>{{name}}:</dt>
    <dd>{{#list options ', '}}<a href="#" data-name="{{../name}}">{{this}}</a>{{/list}}</dd>
    {{/each}}
    <dt></dt><dd>
      <a href="#" data-action="expand"><?php /* translators: woocommerce */ _e( 'Expand all', 'woocommerce' ); ?></a>
      <a href="#" data-action="close"><?php /* translators: woocommerce */ _e( 'Close all', 'woocommerce' ); ?></a>
    </dd>
  </dl>
  {{/with}}
  {{#is type 'variation'}}
  <dl class="variant">
    {{#each attributes}}
    <dt>{{name}}:</dt>
    <dd>{{option}}</dd>
    {{/each}}
  </dl>
  {{/is}}
  {{#if managing_stock}}
  <small><?php /* translators: woocommerce */ printf( __( '%s in stock', 'woocommerce' ), '{{number stock_quantity precision="auto"}}' ); ?></small>
  {{/if}}
</div>
<div class="price">
  {{#if on_sale}}<del>{{#list regular_price ' - '}}{{{money this}}}{{/list}}</del>{{/if}} {{#list price ' - '}}{{{money this}}}{{/list}}
</div>
{{#is type 'variable'}}
<div class="action"><a data-action="variations" class="btn btn-success btn-circle" href="#"><i class="icon-chevron-right icon-lg"></i></a></div>
{{else}}
<div class="action"><a data-action="add" class="btn btn-success btn-circle" href="#"><i class="icon-plus icon-lg"></i></a></div>
{{/is}}