<?php
/**
 * Template for the reciept
 */
?>

<script type="text/template" id="tmpl-receipt">
  <div class="status"></div>
  <div class="list-header">
    <div class="qty"><?php _ex( 'Qty', 'Abbreviation of Quantity', 'woocommerce-pos' ); ?></div>
    <div class="title"><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></div>
    <div class="price"><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></div>
    <div class="total"><?php /* translators: woocommerce */ _e( 'Total', 'woocommerce' ); ?></div>
  </div>
  <div class="list"></div>
  <div class="list-totals"></div>
  <div class="list-actions"></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-receipt-items">
{{#each line_items}}
  <li>
    <div class="qty">{{quantity}}</div>
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
      <del>{{{money regular_price}}}</del>
      <ins>{{{money price}}}</ins>
      {{else}}
      {{{money price}}}
      {{/if}}
    </div>
    <div class="total">
      {{#if on_sale}}
      <del>{{{money subtotal}}}</del>
      <ins>{{{money total}}}</ins>
      {{else}}
      {{{money total}}}
      {{/if}}
    </div>
  </li>
{{/each}}
</script>

<script type="text/x-handlebars-template" id="tmpl-receipt-totals">
  <li class="subtotal">
    <div><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</div>
    <div class="total">{{{money subtotal}}}</div>
  </li>
  {{#if has_discount}}
  <li class="cart-discount">
    <div><?php /* translators: woocommerce */ _e( 'Discount', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money cart_discount negative=true}}}</div>
  </li>
  {{/if}}
  {{#each shipping_lines}}
  <li>
    <div>{{method_title}}:</div>
    <div class="total">{{{money total}}}</div>
  </li>
  {{/each}}
  {{#each fee_lines}}
  <li>
    <div>{{title}}:</div>
    <div class="total">{{{money total}}}</div>
  </li>
  {{/each}}
  {{#if has_tax}}
  {{#if itemized}}
  {{#each tax_lines}}
  {{#if has_tax}}
  <li class="tax">
    <div>
      {{#if ../../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
      {{title}}:
    </div>
    <div class="total">{{{money total}}}</div>
  </li>
  {{/if}}
  {{/each}}
  {{else}}
  <li class="tax">
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
  <li class="order-discount">
    <div><?php /* translators: woocommerce */ _e( 'Order Discount', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money order_discount negative=true}}}</div>
  </li>
  {{/if}}
  <!-- end order_discount -->
  <li class="order-total">
    <div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money total}}}</div>
  </li>
  {{#if note}}
  <li class="note">
    <div>{{note}}</div>
  </li>
  {{/if}}
</script>