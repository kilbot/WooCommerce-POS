<?php
/**
 * Template for the product list
 */
?>

<script type="text/template" id="tmpl-products-filter">
	<div class="input-group">
		<div class="input-group-btn dropdown mode">
			<a href="#" data-toggle="dropdown"><i class="icon-search"></i></a>
			<ul class="dropdown-menu" role="menu">
				<li><a href="#" data-action="search"><i class="icon-search"></i> <?php /* translators: woocommerce */ _e( 'Search Products', 'woocommerce' ); ?></a></li>
				<li><a href="#" data-action="barcode"><i class="icon-barcode"></i> <?php _e( 'Scan Barcode', 'woocommerce-pos' ); ?></a></li>
			</ul>
		</div>
		<input type="search" tabindex="1" class="form-control">
		<a class="clear" href="#"><i class="icon-times-circle icon-lg"></i></a>
		<span class="input-group-btn"><a href="#" data-action="sync"><i class="icon-refresh"></i></a></span>
	</div>
</script>

<script type="text/x-handlebars-template" id="tmpl-product">
	<div class="img"><img src="{{featured_src}}" title="#{{id}}"></div>
	<div class="title">
		<strong>{{title}}</strong>
    {{#with product_attributes}}
    <i class="icon-info-circle" data-toggle="tooltip" title="
    <dl>
      {{#each this}}
      <dt>{{name}}:</dt>
      <dd>{{#list options ', '}}{{this}}{{/list}}</dd>
      {{/each}}
    </dl>
    "></i>
    {{/with}}
    {{#with product_variations}}
    <dl class="variations">
      {{#each this}}
      <dt>{{name}}:</dt>
      <dd>{{#list options ', '}}<a href="#" data-name="{{../name}}">{{this}}</a>{{/list}}</dd>
      {{/each}}
      <dt></dt><dd>
        <a href="#" data-action="expand"><?php /* translators: woocommerce */ _e( 'Expand all', 'woocommerce' ); ?></a>
        <a href="#" data-action="close"><?php /* translators: woocommerce */ _e( 'Close all', 'woocommerce' ); ?></a>
      </dd>
    </dl>
    {{/with}}
    {{#is type 'variation'}}
    <dl class="variant">
      {{#each attributes}}
      <dt>{{name}}:</dt>
      <dd>{{option}}</dd>
      {{/each}}
    </dl>
    {{/is}}
		{{#if managing_stock}}
		<small><?php /* translators: woocommerce */ printf( __( '%s in stock', 'woocommerce' ), '{{number stock_quantity precision="auto"}}' ); ?></small>
		{{/if}}
	</div>
	<div class="price">
    {{#if on_sale}}
      <del>{{#list regular_price ' - '}}{{{money this}}}{{/list}}</del>
      <ins>{{#list sale_price ' - '}}{{{money this}}}{{/list}}</ins>
    {{else}}
      {{#list price ' - '}}{{{money this}}}{{/list}}
    {{/if}}
	</div>
	{{#is type 'variable'}}
	<div class="action"><a data-action="variations" class="btn btn-success btn-circle" href="#"><i class="icon-chevron-right icon-lg"></i></a></div>
	{{else}}
	<div class="action"><a data-action="add" class="btn btn-success btn-circle" href="#"><i class="icon-plus icon-lg"></i></a></div>
	{{/is}}
</script>

<script type="text/template" id="tmpl-products-empty">
	<div class="empty"><?php /* translators: woocommerce */ _e( 'No Products found', 'woocommerce' ); ?></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-pagination">
  <small class="info">
    <?= sprintf( __( 'Showing %s of %s', 'woocommerce-pos' ), '{{showing}}', '{{local}}' ); ?>
    {{#if hasQueue}}(<?= sprintf( __( '%s in queue', 'woocommerce-pos' ), '{{queue}}' ); ?>){{/if}}
  </small>
</script>