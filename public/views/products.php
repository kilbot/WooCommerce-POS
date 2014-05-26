<?php 
/**
 * Template for the product list
 */
?>

<div id="filter">
	<i class="fa fa-search"></i>
	<input type="search" placeholder="Search for products" tabindex="1">
	<a class="clear" href="#"><i class="fa fa-times-circle fa-lg"></i></a>
</div>
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
		<tbody id="product-list" class="empty">
			<tr>
				<td colspan="4"><?php _e( 'No products', 'woocommerce-pos' ); ?></td>
			</tr>
		</tbody>
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
	<td class="add"><a class="add-to-cart btn btn-success btn-circle" href="#"><i class="fa fa-plus"></i></a></td>
</script>

<script type="text/template" id="tmpl-pagination">
	<div>
		<a href="#" class="prev btn btn-default alignleft"><i class="fa fa-chevron-left"></i></a> 
		<a href="#" class="next btn btn-default alignright"><i class="fa fa-chevron-right"></i></a>
		<small>
			Page <%= currentPage %> of <%= totalPages ? totalPages : 1 %>. Showing <%= currentRecords %> of <%= totalRecords ? totalRecords : 0  %> products. <br>
			Last updated <%= last_update %>. <a href="#" class="sync"><i class="fa fa-refresh"></i> sync</a> | <a href="#" class="destroy"><i class="fa fa-times-circle"></i> clear</a>
		</small>
	</div>
</script>

<script type="text/template" id="tmpl-fallback-pagination">
	<div>
		<a href="#" class="prev btn btn-default alignleft"><i class="fa fa-chevron-left"></i></a> 
		<a href="#" class="next btn btn-default alignright"><i class="fa fa-chevron-right"></i></a>
		<small>
			Page <%= currentPage %> of <%= totalPages ? totalPages : 1 %>. Showing <%= currentRecords %> of <%= totalRecords ? totalRecords : 0  %> products. <br>
			<?php _e( 'Your browser does not support indexeddb', 'woocommerce-pos' ); ?>
		</small>
	</div>
</script>