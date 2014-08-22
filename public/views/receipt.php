<?php 
/**
 * Template for the reciept
 */
?>

<script type="text/x-handlebars-template" id="tmpl-receipt">

	<div id="receipt-status" class="status {{status}}">
		<h4 class="text-center">
			{{#if payment_details.paid}}
			<?php _e( 'Paid', 'woocommerce-pos' ); ?>:
			{{else}}
			<?php _e( 'To Pay', 'woocommerce-pos' ); ?>:
			{{/if}}
			{{{money total}}}
		</h4>
	</div>

	{{#if show_message}}
	<div id="receipt-message">
		{{message}}
	</div>
	{{/if}}

	<div id="receipt">

		<table class="table">
			<thead>
				<tr>
					<th><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
					<th><?php _e( 'Qty', 'woocommerce-pos' ); ?></th>
					<th><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
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
							{{#if discounted}}
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
				{{#if show_cart_discount}}
				<tr class="cart-discount">
					<th colspan="2"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
					<td colspan="1">{{{money cart_discount negative=true}}}</td>
				</tr>
				{{/if}}
				{{#if show_tax}}
					{{#if show_itemized}}
						{{#each tax_lines}}
							<tr class="tax">
								<th colspan="2">{{title}}:</th>
								<td colspan="1">{{{money total}}}</td>
							</tr>
						{{/each}}
					{{else}}
						<tr class="tax">
							<th colspan="2"><?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:</th>
							<td colspan="1">{{{money totals_tax}}}</td>
						</tr>
					{{/if}}
				{{/if}}
				{{#if show_order_discount}}
				<tr class="order-discount">
					<th colspan="2"><?php _e( 'Order Discount', 'woocommerce-pos' ); ?>:</th>
					<td colspan="1">{{{money order_discount negative=true}}}</td>
				</tr>
				{{/if}}
				<tr class="order-total">
					<th colspan="2"><?php _e( 'Order Total', 'woocommerce-pos' ); ?>:</th>
					<td colspan="1">{{{money total}}}</td>
				</tr>
				<tr class="note" {{#unless totals.note}}style="display:none"{{/unless}}>
					<td colspan="5">{{note}}</td>
				</tr>
			</tfoot>
		</table>

	</div>
	<div id="receipt-actions" class="action-btns">

		<button class="btn action-print pull-left"><?php _e( 'Print', 'woocommerce-pos' ); ?></button>
		<button class="btn action-email pull-left"><?php _e( 'Email', 'woocommerce-pos' ); ?></button>

		{{#unless payment_details.paid}}
		<button class="btn action-refresh"><?php _e( 'Refresh', 'woocommerce-pos' ); ?></button>
		{{/unless}}

		<button class="btn btn-primary action-new-order"><?php _e( 'New Order', 'woocommerce-pos' ); ?></button>

	</div>
</script>