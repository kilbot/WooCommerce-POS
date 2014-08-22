<!DOCTYPE html>
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
		body {
			font-family: 'Arial', sans-serif;
			line-height: 1.4;
			font-size: 12px;
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
			border-bottom: 1px solid #bbb;
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
	</style>
</head>

<body>
	<div class="order-branding">
		<!-- <img src="logo" alt=""> -->
		<h1><?php bloginfo( 'name' ); ?></h1>
		<!-- address, phone number -->
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
			<th><?php _e( 'Order Number', 'woocommerce-pos' ); ?></th>
			<td>{{order_number}}</td>
		</tr>
		<tr>
			<th><?php _e( 'Order Date', 'woocommerce-pos' ); ?></th>
			<td>{{formatDate completed_at format="MMMM Do YYYY, h:mm:ss a"}}</td>
		</tr>
		<tr>
			<th><?php _e( 'Payment Method', 'woocommerce-pos' ); ?></th>
			<td>{{payment_details.method_title}}</td>
		</tr>
		{{#if billing_address.email}}
		<tr>
			<th><?php _e( 'Email', 'woocommerce-pos' ); ?></th>
			<td>{{billing_address.email}}</td>
		</tr>
		{{/if}}
		{{#if billing_address.phone}}
		<tr>
			<th><?php _e( 'Telephone', 'woocommerce-pos' ); ?></th>
			<td>{{billing_address.phone}}</td>
		</tr>
		{{/if}}
	</table>
	<table class="order-items">
		<thead>
			<tr>
				<th class="product"><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
				<th class="qty"><?php _e( 'Qty', 'woocommerce-pos' ); ?></th>
				<th class="price"><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
			</tr>
		</thead>
		<tbody>
			{{#each line_items}}
				<tr>
					<td class="product">
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
					<td class="price">
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
				<th colspan="2"><?php _e( 'Cart Subtotal', 'woocommerce-pos' ); ?>:</th>
				<td colspan="1">{{{money subtotal}}}</td>
			</tr>
			{{#compare cart_discount '!==' '0.00'}}
			<tr class="cart-discount">
				<th colspan="2"><?php _e( 'Cart Discount', 'woocommerce-pos' ); ?>:</th>
				<td colspan="1">{{{money cart_discount negative=true}}}</td>
			</tr>
			{{/compare}}
			{{#compare total_tax '!==' '0.00'}}
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
						<td colspan="1">{{{money total_tax}}}</td>
					</tr>
				{{/if}}
			{{/compare}}
			{{#compare order_discount '!==' '0.00'}}
			<tr class="order-discount">
				<th colspan="2"><?php _e( 'Order Discount', 'woocommerce-pos' ); ?>:</th>
				<td colspan="1">{{{money order_discount negative=true}}}</td>
			</tr>
			{{/compare}}
			<tr class="order-total">
				<th colspan="2"><?php _e( 'Order Total', 'woocommerce-pos' ); ?>:</th>
				<td colspan="1">{{{money total}}}</td>
			</tr>
		</tfoot>
	</table>
	<div class="order-notes">{{note}}</div>
	<div class="order-thanks"></div>
	<div class="order-colophon">
		<div class="colophon-policies"></div>
		<div class="colophon-imprint"></div>
	</div>
</body>
</html>