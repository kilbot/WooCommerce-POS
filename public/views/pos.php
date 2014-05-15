<?php include_once( 'header.php' ); ?>

<main id="main" class="site-main" role="main">
	<section class="col leftcol">
	
		<div id="filter"><i class="fa fa-search"></i><input type="search" placeholder="Search for products" tabindex="1"></div>
		<div id="products">
			<table cellspacing="0">
				<thead>
					<tr>
						<th>&nbsp;</th>
						<th>Product</th>
						<th>Price</th>
						<th>&nbsp;</th>
					</tr>
				</thead>
				<tbody id="product-list"></tbody>
			</table>
		</div>
		<div id="pagination"><span></span></div>

		<script type="text/template" id="tmpl-product">
			<td class="img"><img src="<%= featured_src %>"></td>
			<td class="name">
				<strong><%= title %></strong>
				<%= typeof(variation_html) !== 'undefined' ? variation_html : '' %>
				<small><%= managing_stock ? stock_quantity + ' in stock' : '' %></small>
			</td>
			<td class="price"><%= price_html %></td>
			<td class="add"><a class="add-to-cart btn btn-circle btn-flat-action" href="#"><i class="fa fa-plus"></i></a></td>
		</script>

		<script type="text/template" id="tmpl-pagination">
			<div>
				<a href="#" class="prev btn btn-flat alignleft"><i class="fa fa-chevron-left"></i></a> 
	    		<a href="#" class="next btn btn-flat alignright"><i class="fa fa-chevron-right"></i></a>
	    		<small>
	    			Page <%= currentPage %> of <%= totalPages ? totalPages : 1 %>. Showing <%= currentRecords %> of <%= totalRecords ? totalRecords : 0  %> products. <br>
	    			Last updated <%= last_update %>. <a href="#" class="sync"><i class="fa fa-refresh"></i> sync</a> | <a href="#" class="destroy"><i class="fa fa-times-circle"></i> clear</a>
				</small>
			</div>
		</script>

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
			<td class="qty"><input class="btn btn-pill btn-flat" type="text" value="<%= qty %>"></td>
			<td class="name">
				<%= title %>
				<%= variation_html %>
			</td>
			<td class="item-price" data-price="<%= price %>"><%= price_html %></td>
			<td class="sub-total"><%= total %></td>
			<td class="remove-item"><a class="remove-from-cart btn btn-circle btn-flat-caution" href="?remove_item=<%= cart_item_key %>" data-cart_item_key="<%= cart_item_key %>"><i class="fa fa-times"></i></a></td>
		</script>

		<script type="text/template" id="tmpl-cart-total">
			<th colspan="3"><%= title %></th>
			<td colspan="2"><%= total %></td>
	    </script>

	    <script type="text/template" id="tmpl-idb-meta">
			There are <%= total %> items in local store, last updated on <%= last_update %>.
	    </script>

	</section><!-- /right col -->
</main><!-- /main -->
	
<?php include_once( 'footer.php' ); ?>