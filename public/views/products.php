<?php 
/**
 * Template for the product list
 */
?>

<div id="filter">
	<i class="fa fa-search"></i>
	<input type="search" placeholder="<?php _e( 'Search for products', 'woocommerce-pos' ); ?>" tabindex="1"  autofocus="autofocus">
	<a class="clear" href="#"><i class="fa fa-times-circle fa-lg"></i></a>
</div>
<div id="products">
	<table cellspacing="0">
		<thead>
			<tr>
				<th>&nbsp;</th>
				<th><?php _e( 'Product', 'woocommerce-pos' ); ?></th>
				<th><?php _e( 'Price', 'woocommerce-pos' ); ?></th>
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
<div id="pagination"></div>

<script type="text/x-handlebars-template" id="tmpl-product">
	<td class="img"><img src="{{featured_src}}"></td>
	<td class="name">
		<strong>{{title}}</strong>
		{{#with attributes}}
			<dl>
			{{#each this}}
				<dt>{{name}}:</dt>
				<dd>{{option}}</dd>
			{{/each}}
			</dl>
		{{/with}}
		{{#if managing_stock}}
			<small>{{stock_quantity}} <?php _ex( 'in stock', '%d in stock', 'woocommerce-pos' ) ?></small>
		{{/if}}
	</td>
	<td class="price">{{{price_html}}}</td>
	<td class="add"><a class="add-to-cart btn btn-success btn-circle" href="#"><i class="fa fa-plus"></i></a></td>
</script>

<script type="text/x-handlebars-template" id="tmpl-pagination">
	<a href="#" class="prev btn btn-default alignleft"><i class="fa fa-chevron-left"></i></a> 
	<a href="#" class="next btn btn-default alignright"><i class="fa fa-chevron-right"></i></a>
	<small>
		<?= sprintf( __( 'Page %s of %s', 'woocommerce-pos' ), '{{currentPage}}', '{{totalPages}}' ); ?>. 
		<?= sprintf( __( 'Showing %s of %s products', 'woocommerce-pos' ), '{{currentRecords}}', '{{totalRecords}}' ); ?>.<br>
		{{#if last_update}}
			<?= sprintf( __( 'Last updated %s', 'woocommerce-pos' ), '{{last_update}}' ); ?>.
			<a href="#" class="sync"><i class="fa fa-refresh"></i> <?php _e( 'sync', 'woocommerce-pos' ); ?></a> | <a href="#" class="destroy"><i class="fa fa-times-circle"></i> <?php _e( 'clear', 'woocommerce-pos' ); ?></a>
		{{else}}
			<?php _e( 'Your browser does not support indexeddb', 'woocommerce-pos' ); ?>
		{{/if}}
	</small>
</script>