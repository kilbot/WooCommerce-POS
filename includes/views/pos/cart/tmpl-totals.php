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
{{#each coupon_lines}}
<li class="list-row coupons">
  <div>
    {{#if id}}
      {{code}}:
    {{else}}
      <input data-toggle="dropdown" type="text" class="form-control" placeholder="<?php /* translators: woocommerce */ _e( 'Search coupons', 'woocommerce' ); ?>">
    {{/if}}
  </div>
  <div class="total">{{{money total negative=true}}}</div>
  <div class="action">
    <a href="#" data-action="remove-coupon" data-coupon_id="{{id}}">
      <i class="icon-remove icon-lg icon-tertiary"></i>
    </a>
  </div>
</li>
{{/each}}
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
    <!-- <a href="#" data-action="toggle-tax" data-rate_id="{{rate_id}}">
      <i class="icon-{{#if enabled}}remove{{else}}add{{/if}} icon-lg icon-tertiary"></i>
    </a> -->
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
    <!-- <a href="#" data-action="toggle-tax">
      <i class="icon-{{#if taxes_enabled}}remove{{else}}add{{/if}} icon-lg icon-tertiary"></i>
    </a> -->
  </div>
</li>
{{/if}}
{{/compare}}
<li class="list-row order-total">
  <div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
  <div class="total">{{{money total}}}</div>
  <div class="action"></div>
</li>