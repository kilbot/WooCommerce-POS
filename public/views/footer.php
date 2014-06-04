</div><!-- /page -->

<div id="menu" class="pushy pushy-left">
	<ul>
		<li><a href="<?= admin_url(); ?>"><?php _e( 'WP Dashboard', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('edit.php?post_type=product'); ?>"><?php _e( 'View Products', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('post-new.php?post_type=product'); ?>"><?php _e( 'Add Product', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('edit.php?post_type=shop_order'); ?>"><?php _e( 'View Orders', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('users.php'); ?>"><?php _e( 'View Customers', 'woocommerce-pos' ); ?></a></li>
	</ul>
</div><!-- /menu -->

<?php WooCommerce_POS::pos_print_js('footer'); ?>

</body>
</html>