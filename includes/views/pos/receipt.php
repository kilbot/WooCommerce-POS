<?php
/**
 * Template for the reciept
 */
?>

<script type="text/x-handlebars-template" id="tmpl-receipt">

  <table class="table">
    <thead>
    <tr>
      <th><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></th>
      <th><?php /* translators: woocommerce */ _e( 'Qty', 'woocommerce' ); ?></th>
      <th><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></th>
    </tr>
    </thead>
    <tbody>
    {{#each line_items}}
    <tr>
      <td class="name">
        {{name}}
        {{#with attributes}}
        <dl>
          {{#each this}}
          <dt>{{name}}:</dt>
          <dd>{{option}}</dd>
          {{/each}}
        </dl>
        {{/with}}
      </td>
      <td class="qty">{{quantity}}</td>
      <td class="total">
        {{#compare total '!==' subtotal}}
        <del>{{{money subtotal}}}</del>
        <ins>{{{money total}}}</ins>
        {{else}}
        {{{money total}}}
        {{/compare}}
      </td>
    </tr>
    {{/each}}
    </tbody>
    <tfoot>
    <tr class="subtotal">
      <th colspan="2"><?php /* translators: woocommerce */ _e( 'Cart Subtotal', 'woocommerce' ); ?>:</th>
      <td colspan="1">{{{money subtotal}}}</td>
    </tr>
    {{#compare cart_discount '!==' 0}}
    <tr class="cart-discount">
      <th colspan="2"><?php /* translators: woocommerce */ _e( 'Cart Discount', 'woocommerce' ); ?>:</th>
      <td colspan="1">{{{money cart_discount negative=true}}}</td>
    </tr>
    {{/compare}}
    {{#each fee_lines}}
    <tr class="fee">
      <th colspan="2">{{title}}:</th>
      <td colspan="1">{{{money total}}}</td>
    </tr>
    {{/each}}
    {{#compare total_tax '!==' 0}}
    {{#if show_itemized}}
    {{#each tax_lines}}
    <tr class="tax">
      <th colspan="2">
        {{#if ../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
        {{title}}:
      </th>
      <td colspan="1">{{{money total}}}</td>
    </tr>
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
    {{/compare}}
    {{#compare order_discount '!==' 0}}
    <tr class="order-discount">
      <th colspan="2"><?php /* translators: woocommerce */ _e( 'Order Discount', 'woocommerce' ); ?>:</th>
      <td colspan="1">{{{money order_discount negative=true}}}</td>
    </tr>
    {{/compare}}
    <tr class="order-total">
      <th colspan="2"><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</th>
      <td colspan="1">{{{money total}}}</td>
    </tr>
    <tr class="note" {{#unless note}}style="display:none"{{/unless}}>
    <td colspan="5">{{note}}</td>
    </tr>
    </tfoot>
  </table>

</script>