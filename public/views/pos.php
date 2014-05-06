<?php include_once( 'header.php' ); ?>

<main id="main" class="site-main" role="main">
	<section class="col leftcol">
	
		<div id="filter"><i class="fa fa-search"></i></div>
		<div id="products"><img class="loading" src="<?= WC_POS()->plugin_url ?>/assets/ajax-loader.gif" alt="loading ..."></div>
		<div id="pagination"></div>

	</section><!-- /left col --> 

	<section class="col rightcol">  

		<div id="cart">
			<table class="shop_table table-stroke cart" cellspacing="0">
				<thead>
					<tr>
						<th>Qty</th>
						<th>Product</th>
						<th>Price</th>
						<th>Total</th>
						<th>&nbsp;</th>
					</tr>
				</thead>
				<tbody id="cart-items"></tbody>
				<tfoot id="cart-totals"></tfoot>
			</table>
			<div class="actions">
				<button type="submit" class="btn btn-flat-action btn-checkout" name="pos_checkout" id="pos_checkout" value="checkout">Checkout <i class="fa fa-chevron-right"></i></button>
			</div>
		</div>

		<script type="text/template" id="tmpl-cart-item">
			<td class="qty"><%= qty %></td>
			<td class="name"><%= title %></td>
			<td class="item-price" data-price="<%= price %>"><%= price_html %></td>
			<td class="sub-total"><%= total %></td>
			<td class="remove-item"><a class="remove-from-cart btn btn-circle btn-flat-caution" href="?remove_item=<%= cart_item_key %>" data-cart_item_key="<%= cart_item_key %>"><i class="fa fa-times"></i></a></td>
		</script>

		<script type="text/template" id="tmpl-cart-total">
			<th colspan="3"><%= title %></th>
			<td colspan="2"><%= total %></td>
	    </script>

	</section><!-- /right col -->
</main><!-- /main -->
	
<?php include_once( 'footer.php' ); ?>