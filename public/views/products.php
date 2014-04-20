<table id="products" class="shop_table table-stroke products" cellspacing="0">
	<thead>
		<tr>
			<th width="100"></th>
			<th><?php _e( 'Product', 'woocommerce' ); ?></th>
			<th width="60"><?php _e( 'Price', 'woocommerce' ); ?></th>
			<th width="60"></th>
		</tr>
	</thead>
	<tbody>
	<?php $found_products = apply_filters('all_products_and_variations'); if($found_products) foreach ( $found_products as $id => $sales ) : $product = get_product( $id ); ?>
		<?php if(!$product->is_type('variable')) : ?>
		<tr>
			<td><?= $product->get_image(); ?></td>
			<td><strong><?= $product->get_title(); ?> <?= $product->is_type('variation') ? '- <em>'.implode( ', ', $product->get_variation_attributes() ).'</em>' : '' ; ?></strong><br />
			<em><?= $product->get_stock_quantity(); ?> in stock</em>
			</td>
			<td><?= $product->get_price_html(); ?>
			<td class="add">
				<a data-role="button" data-theme="g" data-icon="plus" href="<?php do_action('pos_add_to_cart_url',$product); ?>">Add</a>
			</td>
		</tr>
		<?php endif; ?>
	<?php endforeach; ?>
	</tbody>
</table>
<script type="text/javascript" charset="utf-8">
$(document).ready(function(){
	$('#products').dataTable({
		"bSort": false, // turn off default sorting
		"iDisplayLength": 5, // number of rows
		"aLengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]] // rows per page drop down
	});
});
</script>
