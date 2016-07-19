<li class="list-row subtotal">
  <div><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</div>
  <div class="total">{{{money subtotal}}}</div>
</li>
{{#if has_discount}}
<li class="list-row cart-discount">
  <div><?php /* translators: woocommerce */ _e( 'Discount', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money cart_discount negative=true}}}</div>
</li>
{{/if}}
{{#each shipping_lines}}
<li class="list-row">
  <div>{{method_title}}:</div>
  <div class="total">{{{money total}}}</div>
</li>
{{/each}}
{{#each fee_lines}}
<li class="list-row">
  <div>{{title}}:</div>
  <div class="total">{{{money total}}}</div>
</li>
{{/each}}
{{#if has_tax}}
{{#if itemized}}
{{#each tax_lines}}
{{#if has_tax}}
<li class="list-row tax">
  <div>
    {{#if ../../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
    {{title}}:
  </div>
  <div class="total">{{{money total}}}</div>
</li>
{{/if}}
{{/each}}
{{else}}
<li class="list-row tax">
  <div>
    {{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
    <?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
  </div>
  <div class="total">{{{money total_tax}}}</div>
</li>
{{/if}}
{{/if}}
<!-- order_discount removed in WC 2.3, included for backwards compatibility -->
{{#if has_order_discount}}
<li class="list-row order-discount">
  <div><?php /* translators: woocommerce */ _e( 'Order Discount', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money order_discount negative=true}}}</div>
</li>
{{/if}}
<!-- end order_discount -->
<li class="list-row order-total">
  <div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money total}}}</div>
</li>
{{#if note}}
<li class="list-row note">
  <div>{{note}}</div>
</li>
{{/if}}