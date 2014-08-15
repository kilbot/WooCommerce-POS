<?php 
/**
 * Template for the product list
 */
?>

<script type="text/template" id="tmpl-products-layout">
	<div id="products-filter" class="search"></div>
	<div id="products-tabs" class="tabs infinite-tabs"></div>
	<div id="products"></div>
	<div id="products-pagination"></div>
</script>

<script type="text/template" id="tmpl-products-filter">
<div class="input-group">
	<div class="input-group-btn">
		<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="fa {{#is search_mode 'barcode'}}fa-barcode{{else}}fa-search{{/is}}"></i></button>
		<ul class="dropdown-menu" role="menu">
			<li><a href="#" class="action-search"><i class="fa fa-search"></i> Search</a></li>
			<li><a href="#" class="action-barcode"><i class="fa fa-barcode"></i> Scan Barcode</a></li>
		</ul>
	</div><!-- /btn-group -->
	{{#is search_mode 'barcode'}}
	<input type="search" placeholder="<?php _e( 'Scan Barcode', 'woocommerce-pos' ); ?>" tabindex="1"  autofocus="autofocus" class="form-control">
	{{else}}
	<input type="search" placeholder="<?php _e( 'Search for products', 'woocommerce-pos' ); ?>" tabindex="1"  autofocus="autofocus" class="form-control">
	{{/is}}
	<span class="input-group-addon clear-btn"><a class="clear" href="#"><i class="fa fa-times-circle fa-lg"></i></a></span>
	{{#is sync_mode 'client'}}
	<div class="input-group-btn">
        <button type="button" class="btn btn-default action-sync"><i class="fa fa-refresh"></i></button>
    </div>
    {{/is}}
</div><!-- /input-group -->
</script>

<script type="text/x-handlebars-template" id="tmpl-product">
	<div class="img"><img src="{{featured_src}}" title="#{{id}}"></div>
	<div class="name">
		<strong>{{title}}</strong>
		{{#with attributes}}
			<dl>
			{{#each this}}
			{{#if variation}}
				<dt>{{name}}:</dt>
				<dd>{{#csv options}}{{this}}{{/csv}}</dd>
			{{/if}}
			{{#unless variation}}
				<dt>{{name}}:</dt>
				<dd>{{option}}</dd>
			{{/unless}}
			{{/each}}
			</dl>
		{{/with}}
		{{#if managing_stock}}
			<small>{{stock_quantity}} <?php _ex( 'in stock', '%d in stock', 'woocommerce-pos' ) ?></small>
		{{/if}}
	</div>
	<div class="price">
		{{#is type 'variation'}}
			{{#if on_sale}}
				<del>{{{money regular_price}}}</del> <ins>{{{money sale_price}}}</ins>
			{{else}}
				{{{money price}}}
			{{/if}}
		{{else}}
			{{{price_html}}}
		{{/is}}
	</div>
	{{#is type 'variable'}}
		<div class="action"><a class="btn btn-success btn-circle action-variations" href="#"><i class="fa fa-chevron-right"></i></a></div>
	{{else}}
		<div class="action"><a class="btn btn-success btn-circle action-add" href="#"><i class="fa fa-plus"></i></a></div>
	{{/is}}
</script>

<script type="text/template" id="tmpl-products-empty">
	<div class="empty"><?php _e( 'No products found', 'woocommerce-pos' ); ?></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-pagination">
	<a href="#" class="prev btn btn-default pull-left {{#is currentPage 1}}disabled{{/is}}"><i class="fa fa-chevron-left"></i></a> 
	<a href="#" class="next btn btn-default pull-right {{#is currentPage lastPage}}disabled{{/is}}"><i class="fa fa-chevron-right"></i></a>
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