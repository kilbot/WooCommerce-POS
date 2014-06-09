<script type="text/x-handlebars-template" id="tmpl-checkout">
	<div class="modal-dialog">
		<div class="modal-content">
		{{#if order.is_paid}}
			<div class="modal-header">
				<h4><?php _e( 'Order', 'woocommerce-pos' ); ?></h4>
			</div>
			<div id="cart">
				<table>
					<thead>
						<tr>
							<th><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
							<th><?php _e( 'Qty', 'woocommerce-pos' ); ?></th>
							<th><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
						</tr>
					</thead>
					<tbody>
						{{#each cart}}
							<tr>
								<td class="name">
									{{title}}
									{{#with attributes}}
										<dl>
										{{#each this}}
											<dt>{{name}}:</dt>
											<dd>{{option}}</dd>
										{{/each}}
										</dl>
									{{/with}}
								</td>
								<td class="qty">{{qty}}</td>
								<td class="total">
									{{#if discounted}}
										<del>{{{money display_total}}}</del>
										<ins>{{{money discounted}}}</ins>
									{{else}}
										{{{money display_total}}}
									{{/if}}
								</td>
							</tr>
						{{/each}}
					</tbody>
					<tfoot>
						<tr class="subtotal">
							<th colspan="2"><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</th>
							<td colspan="1">{{{money totals.subtotal}}}</td>
						</tr>
						{{#if totals.show_cart_discount}}
						<tr class="cart-discount">
							<th colspan="2"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
							<td colspan="1">{{{money totals.cart_discount negative=true}}}</td>
						</tr>
						{{/if}}
						{{#if totals.show_tax}}
							{{#if totals.show_itemized}}
								{{#each totals.itemized_tax}}
									<tr class="tax">
										<th colspan="2">{{@key}}:</th>
										<td colspan="1">{{{money this}}}</td>
									</tr>
								{{/each}}
							{{else}}
								<tr class="tax">
									<th colspan="2"><?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:</th>
									<td colspan="1">{{{money totals.tax}}}</td>
								</tr>
							{{/if}}
						{{/if}}
						
						<tr class="order-discount" {{#unless totals.show_order_discount}}style="display:none"{{/unless}}>
							<th colspan="2"><?php _e( 'Order Discount', 'woocommerce-pos' ); ?>:</th>
							<td colspan="1">{{{money totals.order_discount negative=true}}}</td>
						</tr>
						<tr class="order-total">
							<th colspan="2"><?php _e( 'Order Total', 'woocommerce-pos' ); ?>:</th>
							<td colspan="1">{{{money totals.total}}}</td>
						</tr>
						<tr class="note" {{#unless totals.note}}style="display:none"{{/unless}}>
							<td colspan="5">{{totals.note}}</td>
						</tr>
						{{#if totals.total_mismatch}}
						<tr>
							<td colspan="3">
								<div class="alert alert-danger textcenter">
								<i class="fa fa-warning"></i> 
								<strong><?php _e( 'Total mismatch!', 'woocommerce-pos' ); ?></strong>
								<?php _e( 'The total calculated at the POS is different to the total calculated by WooCommerce.', 'woocommerce-pos' ); ?>
								<?php _e( 'Please report this problem to <a href="mailto:support@woopos.com.au?subject=Total mismatch">support</a> so we can look into it.', 'woocommerce-pos' ); ?>
								</div>
							</td>
						</tr>
						{{/if}}
					</tfoot>
				</table>
			</div>
			<div class="modal-footer">
				<button class="btn action-print"><?php _e( 'Print', 'woocommerce-pos' ); ?></button>
				<button class="btn btn-primary action-new-order"><?php _e( 'New Order', 'woocommerce-pos' ); ?></button>
			</div>
		{{else}}
			<div class="modal-header">
				<h4><?php _e( 'Payment', 'woocommerce-pos' ); ?></h4>
			</div>
			<div class="modal-body payment">

				<h4 class="textcenter"><?php _e( 'To Pay', 'woocommerce-pos' ); ?>: {{{money totals.total}}}</h4>

				<div class="panel-group" id="payment-options">
					<div class="panel panel-success">
						<div class="panel-heading">
							<h5 data-toggle="collapse" data-target="cash" data-parent="payment-options" class="panel-title">
								<i class="fa fa-square-o"></i><i class="fa fa-check-square-o"></i> Cash
							</h5>
						</div>
					</div>
					<div class="panel panel-default">
						<div class="panel-heading">
							<h5 data-toggle="collapse" data-target="card" data-parent="payment-options" class="panel-title">
								<i class="fa fa-square-o"></i><i class="fa fa-check-square-o"></i> Card
							</h5>
						</div>
					</div>	
				</div>

			</div>
			<div class="modal-footer">
				<button class="btn action-close alignleft"><?php _e( 'Return to Sale', 'woocommerce-pos' ); ?></button>
				<button class="btn btn-success action-paid"><?php _e( 'Mark as Paid', 'woocommerce-pos' ); ?></button>
			</div>
		{{/if}}
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</script>