<!DOCTYPE html>
<html class="no-js" <?php language_attributes(); ?>>
<head>
	<meta charset="UTF-8" />
	<title>Point of Sale - <?php bloginfo('name') ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<?php WooCommerce_POS::pos_print_css(); ?>
	<?php WooCommerce_POS::pos_print_js('head'); ?>
	
</head>
<body>
<div id="page" class="site">
	<header id="masthead" role="banner" class="site-header">
		<a href="#menu" id="menu-btn" class="btn-header alignleft"><i class="fa fa-bars"></i> <span><?php _e( 'Menu', 'woocommerce-pos' ); ?></span></a>
		<div class="dropdown alignright">
			<a href="#" class="btn-header" data-toggle="dropdown">
				<i class="fa fa-cog"></i> <span><?php _e( 'Howdy', 'woocommerce-pos' ); ?>, <?= $current_user->display_name ?></span>
			</a>
			<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
				<li><a href="<?php echo wp_logout_url( home_url() ); ?>" title="Logout"><?php _e( 'Logout', 'woocommerce-pos' ); ?></a></li>
			</ul>
		</div>
		<h1><?php bloginfo( 'name' ); ?></h1>
	</header><!-- /header -->
