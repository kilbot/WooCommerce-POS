<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
  <pulse drawer="drawer_1" time="pulse_100" />

  <text lang="en" smooth="true"><?php bloginfo( 'name' ); ?></text>

  <feed unit="24" />

  <text align="left"><?php /* translators: woocommerce */ _e( 'Order Number', 'woocommerce' ); ?>: {{order_number}}</text>
  <text align="left"><?php _e( 'Order Date', 'woocommerce-pos' ); ?>: {{formatDate completed_at format="MMMM Do YYYY, h:mm:ss a"}}</text>
  {{#if cashier}}
    <text align="left"><?php _e( 'Cashier', 'woocommerce-pos' ); ?>: {{cashier.first_name}} {{cashier.last_name}}</text>
  {{/if}}
  <text align="left"><?php _e( 'Payment Method', 'woocommerce-pos' ); ?>: {{payment_details.method_title}}</text>

  <feed unit="24" />

  {{#each line_items}}
    <text align="left">{{number quantity precision="auto"}}    {{name}}</text>
    {{#with meta}}
      {{#each []}}<text align="left">{{label}}: {{value}}</text>{{/each}}
    {{/with}}
    {{#if on_sale}}
      <text align="right">({{{money subtotal}}}) {{{money total}}}</text>
    {{else}}
      <text align="right">{{{money total}}}</text>
    {{/if}}
  {{/each}}

  <text align="right"><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>: {{{money subtotal}}}</text>
  {{#if has_discount}}
    <text align="right"><?php /* translators: woocommerce */  _e( 'Discount', 'woocommerce' ); ?>: {{{money cart_discount negative=true}}}</text>
  {{/if}}
  {{#each shipping_lines}}
    <text align="right">{{method_title}}: {{{money total}}}</text>
  {{/each}}
  {{#each fee_lines}}
    <text align="right">{{title}}: {{{money total}}}</text>
  {{/each}}
  {{#if has_tax}}
    {{#if itemized}}
      {{#each tax_lines}}
        {{#if has_tax}}
          <text align="right">
            {{#if ../../incl_tax}}(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>){{/if}}
            {{title}}: {{{money total}}}
          </text>
        {{/if}}
      {{/each}}
    {{else}}
      <text align="right">
        {{#if incl_tax}}(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>){{/if}}
        <?php echo esc_html( WC()->countries->tax_or_vat() ); ?>
        {{{money total_tax}}}
      </text>
    {{/if}}
  {{/if}}
  <text align="right"><?php  /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>: {{{money total}}}</text>
  {{#if payment_details.method_pos_cash}}
    <text align="right"><?php _e( 'Amount Tendered', 'woocommerce-pos' ); ?>: {{{money payment_details.method_pos_cash.tendered}}}</text>
    <text align="right"><?php _ex('Change', 'Money returned from cash sale', 'woocommerce-pos'); ?>: {{{money payment_details.method_pos_cash.change}}}</text>
  {{/if}}

  <feed unit="24" />
  
  <text align="left">{{note}}</text>

  <feed unit="24" />
  <cut/>
</epos-print>