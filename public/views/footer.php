</div><!-- /page -->

<div id="menu" class="pushy pushy-left">
	<ul>
		<li><a href="<?= admin_url(); ?>">WP Dashboard</a></li>
		<li><a href="<?= admin_url('edit.php?post_type=product'); ?>">View Products</a></li>
		<li><a href="<?= admin_url('post-new.php?post_type=product'); ?>">Add Product</a></li>
		<li><a href="<?= admin_url('edit.php?post_type=shop_order'); ?>">View Orders</a></li>
		<li><a href="<?= admin_url('users.php'); ?>">View Customers</a></li>
	</ul>
</div><!-- /menu -->

<?php WooCommerce_POS::pos_print_js('footer'); ?>

</body>
</html>