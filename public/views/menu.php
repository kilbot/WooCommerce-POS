<div data-role="panel" data-theme="b" id="nav">
	<ul data-role="listview" data-ajax="false">
		<li><a data-ajax="false" href="<?= admin_url(); ?>">Dashboard</a></li>
		<li><a data-ajax="false" href="<?= admin_url('edit.php?post_type=product'); ?>">View Products</a></li>
		<li><a data-ajax="false" href="<?= admin_url('post-new.php?post_type=product'); ?>">Add Product</a></li>
		<li><a data-ajax="false" href="<?= admin_url('edit.php?post_type=shop_order'); ?>">View Orders</a></li>
		<li><a data-ajax="false" href="<?= admin_url('users.php'); ?>">View Customers</a></li>
		
	</ul>
</div><!-- /panel -->

<div data-role="popup" id="popupMenu" data-theme="b" data-position-to="origin">
        <ul data-role="listview" data-inset="true" style="min-width:210px;">
            <li><a data-ajax="false" href="<?php echo wp_logout_url( home_url() ); ?>" title="Logout">Logout</a></li>
        </ul>
</div>