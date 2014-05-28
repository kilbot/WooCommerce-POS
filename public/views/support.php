<!DOCTYPE html>
<html lang="en-US">
<head>
	<meta charset="UTF-8" />
	<title>Point of Sale - <?php bloginfo('name') ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<?php WooCommerce_POS::pos_print_css(); ?>
	<?php WooCommerce_POS::pos_print_js('head'); ?>

	<link rel="stylesheet" href="<?= WC_POS()->plugin_url; ?>/includes/tests/jasmine.css" type="text/css" media="all" />
		
	<script data-main="<?= WC_POS()->plugin_url; ?>includes/tests/main" src="<?= WC_POS()->plugin_url; ?>public/assets/js/require.js"></script>

</head>
<body>
<div id="page" class="site">
	<header id="masthead" role="banner" class="site-header">
		<a href="#menu" id="menu-btn" class="btn-header alignleft"><i class="fa fa-bars"></i> <span>Menu</span></a>
		<div class="dropdown alignright">
			<a href="#" class="btn-header" data-toggle="dropdown">
				<i class="fa fa-cog"></i> <span><?php _e( 'Howdy', 'woocommerce-pos' ); ?>, <?php global $current_user; get_currentuserinfo(); echo $current_user->display_name ?></span>
			</a>
			<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
				<li><a href="<?php echo wp_logout_url( home_url() ); ?>" title="Logout">Logout</a></li>
			</ul>
		</div>
		<h1><?php bloginfo( 'name' ); ?></h1>
	</header><!-- /header -->


	<main id="main" class="site-main" role="main">
		<h1>Support</h1>
		<h2>Tests</h2>

	</main><!-- /main -->

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

</body>
</html>