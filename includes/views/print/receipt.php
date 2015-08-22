<html>
<head>
  <meta charset="utf-8">
  <title><?php _e( 'Receipt', 'woocommerce-pos' ); ?></title>
  <style>
    /* Reset */
    * {
      background: transparent !important;
      color: #000 !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    body, table {
      font-family: 'Arial', sans-serif;
      line-height: 1.4;
      font-size: 14px;
    }
    h1,h2,h3,h4,h5,h6 {
      margin: 0;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }

    /* Spacing */
    .order-branding, .order-addresses, .order-info, .order-items, .order-notes, .order-thanks {
      margin-bottom: 40px;
    }

    /* Branding */
    .order-branding h1 {
      font-size: 2em;
      font-weight: bold;
    }

    /* Addresses */
    .order-addresses {
      display: table;
      width: 100%;
    }
    .billing-address, .shipping-address {
      display: table-cell;
    }

    /* Order */
    table {
      width: 100%;
    }
    table tr {
      border-bottom: 1px solid #dddddd;
    }
    table th, table td {
      padding: 6px 12px;
    }
    table.order-info {
      border-top: 3px solid #000;
    }
    table.order-info th {
      text-align: left;
      width: 30%;
    }
    table.order-items {
      border-bottom: 3px solid #000;
    }
    table.order-items thead tr {
      border-bottom: 3px solid #000;
    }
    table.order-items tbody tr:last-of-type {
      border-bottom: 1px solid #000;
    }
    .product {
      text-align: left;
    }
    .product dl {
      margin: 0;
    }
    .product dt {
      font-weight: 600;
      padding-right: 6px;
      float: left;
      clear: left;
    }
    .product dd {
      float: left;
      margin: 0;
    }
    .price {
      text-align: right;
    }
    .qty {
      text-align: center;
    }
    tfoot {
      text-align: right;
    }
    tfoot th {
      width: 70%;
    }
    tfoot tr.order-total {
      font-weight: bold;
    }
    tfoot tr.pos_cash-tendered th, tfoot tr.pos_cash-tendered td {
      border-top: 1px solid #000;
    }
  </style>
</head>

<body>
<div class="order-branding">
  <h1><?php bloginfo( 'name' ); ?></h1>
</div>
<div class="order-addresses">
  <div class="billing-address">
    {{formatAddress billing_address title="<?php _e( 'Billing Address', 'woocommerce-pos' ); ?>"}}
  </div>
  <div class="shipping-address">
    {{formatAddress shipping_address title="<?php _e( 'Shipping Address', 'woocommerce-pos' ); ?>"}}
  </div>
</div>
<table class="order-info">
  <tr>
    <th><?php /* translators: woocommerce */ _e( 'Order Number', 'woocommerce' ); ?></th>
    <td>{{order_number}}</td>
  </tr>
  <tr>
    <th><?php _e( 'Order Date', 'woocommerce-pos' ); ?></th>
    <td>{{formatDate completed_at format="MMMM Do YYYY, h:mm:ss a"}}</td>
  </tr>
  {{#if cashier}}
  <tr>
    <th><?php _e( 'Cashier', 'woocommerce-pos' ); ?></th>
    <td>{{cashier.first_name}} {{cashier.last_name}}</td>
  </tr>
  {{/if}}
  <tr>
    <th><?php _e( 'Payment Method', 'woocommerce-pos' ); ?></th>
    <td>{{payment_details.method_title}}</td>
  </tr>
  {{#if billing_address.email}}
  <tr>
    <th><?php /* translators: woocommerce */ _e( 'Email', 'woocommerce' ); ?></th>
    <td>{{billing_address.email}}</td>
  </tr>
  {{/if}}
  {{#if billing_address.phone}}
  <tr>
    <th><?php /* translators: woocommerce */ _e( 'Telephone', 'woocommerce' ); ?></th>
    <td>{{billing_address.phone}}</td>
  </tr>
  {{/if}}
</table>
<table class="order-items">
  <thead>
    <tr>
      <th class="product"><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></th>
      <th class="qty"><?php _ex( 'Qty', 'Abbreviation of Quantity', 'woocommerce-pos' ); ?></th>
      <th class="price"><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></th>
    </tr>
  </thead>
  <tbody>
  {{#each line_items}}
    <tr>
      <td class="product">
        {{name}}
        {{#with meta}}
        <dl class="meta">
          {{#each []}}
          <dt>{{label}}:</dt>
          <dd>{{value}}</dd>
          {{/each}}
        </dl>
        {{/with}}
      </td>
      <td class="qty">{{number quantity precision="auto"}}</td>
      <td class="price">
        {{#if on_sale}}
        <del>{{{money subtotal}}}</del>
        <ins>{{{money total}}}</ins>
        {{else}}
        {{{money total}}}
        {{/if}}
      </td>
    </tr>
  {{/each}}
  </tbody>
  <tfoot>
    <tr class="subtotal">
      <th colspan="2"><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</th>
      <td colspan="1">{{{money subtotal}}}</td>
    </tr>
    {{#if has_discount}}
      <tr class="cart-discount">
        <th colspan="2"><?php /* translators: woocommerce */  _e( 'Discount', 'woocommerce' ); ?>:</th>
        <td colspan="1">{{{money cart_discount negative=true}}}</td>
      </tr>
    {{/if}}
    {{#each shipping_lines}}
      <tr class="shipping">
        <th colspan="2">{{method_title}}:</th>
        <td colspan="1">{{{money total}}}</td>
      </tr>
    {{/each}}
    {{#each fee_lines}}
      <tr class="fee">
        <th colspan="2">{{title}}:</th>
        <td colspan="1">{{{money total}}}</td>
      </tr>
    {{/each}}
    {{#if has_tax}}
      {{#if itemized}}
        {{#each tax_lines}}
          {{#if has_tax}}
            <tr class="tax">
              <th colspan="2">
                {{#if ../../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
                {{title}}:
              </th>
              <td colspan="1">{{{money total}}}</td>
            </tr>
          {{/if}}
        {{/each}}
      {{else}}
        <tr class="tax">
          <th colspan="2">
            {{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
            <?php echo esc_html( WC()->countries->tax_or_vat() ); ?>
          </th>
          <td colspan="1">{{{money total_tax}}}</td>
        </tr>
      {{/if}}
    {{/if}}
    <!-- order_discount removed in WC 2.3, included for backwards compatibility -->
    {{#if has_order_discount}}
    <tr class="order-discount">
      <th colspan="2"><?php  /* translators: woocommerce */ _e( 'Order Discount', 'woocommerce' ); ?>:</th>
      <td colspan="1">{{{money order_discount negative=true}}}</td>
    </tr>
    {{/if}}
    <!-- end order_discount -->
    <tr class="order-total">
      <th colspan="2"><?php  /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</th>
      <td colspan="1">{{{money total}}}</td>
    </tr>
    {{#if payment_details.method_pos_cash}}
    <tr class="pos_cash-tendered">
      <th colspan="2"><?php _e( 'Amount Tendered', 'woocommerce-pos' ); ?>:</th>
      <td colspan="1">{{{money payment_details.method_pos_cash.tendered}}}</td>
    </tr>
    <tr class="pos_cash-change">
      <th colspan="2"><?php _ex('Change', 'Money returned from cash sale', 'woocommerce-pos'); ?>:</th>
      <td colspan="1">{{{money payment_details.method_pos_cash.change}}}</td>
    </tr>
    {{/if}}
  </tfoot>
</table>
<div class="order-notes">{{note}}</div>
</body>
</html>