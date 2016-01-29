<li class="list-row subtotal">
  <div><?php /* translators: woocommerce */ _e( 'Subtotal', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money subtotal}}}</div>
  <div class="action"></div>
</li>
{{#if has_discount}}
<li class="list-row cart-discount">
  <div><?php /* translators: woocommerce */ _e( 'Discount', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money cart_discount negative=true}}}</div>
  <div class="action"></div>
</li>
{{/if}}
{{#compare total_tax '!==' 0}}
{{#if itemized}}
{{#each tax_lines}}
{{#compare total '!==' 0}}
<li class="list-row tax">
  <div>
    {{#if ../../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
    {{title}}:
  </div>
  <div class="total">{{{money total}}}</div>
  <div class="action">
    <a href="#" data-action="toggle-tax">
      <i class="icon-remove icon-lg"></i>
    </a>
  </div>
</li>
{{/compare}}
{{/each}}
{{else}}
<li class="list-row tax">
  <div>
    {{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
    <?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
  </div>
  <div class="total">{{{money total_tax}}}</div>
  <div class="action">
    <a href="#" data-action="toggle-tax">
      <i class="icon-remove icon-lg"></i>
    </a>
  </div>
</li>
{{/if}}
{{/compare}}
<li class="list-row order-total">
  <div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money total}}}</div>
  <div class="action"></div>
</li>