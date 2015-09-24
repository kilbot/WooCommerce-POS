<div>
  <select name="customer_id" id="customer_id" class="select2" style="width:100%" data-select="customer" data-placeholder="<?php /* translators: woocommerce */ _e( 'Search customers', 'woocommerce' ); ?>"></select>
</div>
<div>
  {{#if customer_id}}<a href="#" data-action="remove" title="<?php /* translators: wordpress */ _e( 'Remove' ); ?>"><i class="icon-times-circle"></i></a>{{/if}}
  {{formatCustomerName customer}}
</div>