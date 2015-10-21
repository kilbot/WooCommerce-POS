{{#each line_items}}
<li class="list-row">
  <div class="qty">{{number quantity precision="auto"}}</div>
  <div class="title">
    {{name}}
    {{#with meta}}
    <dl class="meta">
      {{#each []}}
      <dt>{{label}}:</dt>
      <dd>{{value}}</dd>
      {{/each}}
    </dl>
    {{/with}}
  </div>
  <div class="price">
    {{#if on_sale}}
    <del>{{{money regular_price}}}</del> {{{money price}}}
    {{else}}
    {{{money price}}}
    {{/if}}
  </div>
  <div class="total">
    {{#if on_sale}}
    <del>{{{money subtotal}}}</del> {{{money total}}}
    {{else}}
    {{{money total}}}
    {{/if}}
  </div>
</li>
{{/each}}