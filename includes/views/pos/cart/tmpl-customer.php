<div>
	<div class="input-group">
		<span class="input-group-addon"><i class="icon-search"></i></span>
		<input type="text" class="form-control" placeholder="<?php /* translators: woocommerce */ _e( 'Search customers', 'woocommerce' ); ?>">
	</div>
</div>
<div>
  {{#if customer_id}}<a href="#" data-action="remove" title="<?php /* translators: wordpress */ _e( 'Remove' ); ?>"><i class="icon-times-circle"></i></a>{{/if}}
  {{formatCustomerName customer}}
</div>