<!DOCTYPE html>
<html class="no-js" <?php language_attributes(); ?>>
<head>
	<meta charset="UTF-8" />
	<title><?php _e('Point of Sale', 'woocommerce-pos') ?> - <?php bloginfo('name') ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<!-- For iPad with high-resolution Retina display running iOS ≥ 7: -->
	<link rel="apple-touch-icon-precomposed" href="<?= WC_POS()->plugin_url ?>assets/favicon-152.png">
	<link rel="apple-touch-icon-precomposed" sizes="152x152" href="<?= WC_POS()->plugin_url ?>assets/favicon-152.png">

	<!-- For iPad with high-resolution Retina display running iOS ≤ 6: -->
	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?= WC_POS()->plugin_url ?>assets/favicon-144.png">

	<!-- For iPhone with high-resolution Retina display running iOS ≥ 7: -->
	<link rel="apple-touch-icon-precomposed" sizes="120x120" href="<?= WC_POS()->plugin_url ?>assets/favicon-120.png">

	<!-- For iPhone with high-resolution Retina display running iOS ≤ 6: -->
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?= WC_POS()->plugin_url ?>assets/favicon-114.png">

	<!-- For first- and second-generation iPad: -->
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?= WC_POS()->plugin_url ?>assets/favicon-72.png">

	<!-- For non-Retina iPhone, iPod Touch, and Android 2.1+ devices: -->
	<link rel="apple-touch-icon-precomposed" href="<?= WC_POS()->plugin_url ?>assets/favicon-57.png">

	<!-- IE 10 Metro tile icon -->
	<meta name="msapplication-TileColor" content="#323A46">
	<meta name="msapplication-TileImage" content="<?= WC_POS()->plugin_url ?>assets/favicon-144.png">

	<?php do_action('woocommerce_pos_head'); ?>
	
</head>
<?php do_action('woocommerce_pos_before'); ?>
<div id="page" class="site">
	<header id="masthead" role="banner" class="site-header">
		<a href="#" id="menu-btn" class="btn-header pull-left"><i class="icon icon-bars"></i> <span><?php _e( 'Menu', 'woocommerce-pos' ); ?></span></a>
		<div class="dropdown pull-right">
			<a href="#" class="btn-header" data-toggle="dropdown">
				<i class="icon icon-cog"></i> <span><?php _e( 'Howdy', 'woocommerce-pos' ); ?>, <?= $current_user->display_name ?></span>
			</a>
			<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
				<li><a href="<?php echo wp_logout_url( home_url() ); ?>" title="Logout"><?php _e( 'Logout', 'woocommerce-pos' ); ?></a></li>
			</ul>
		</div>
		<h1 class="center-block"><?php bloginfo( 'name' ); ?></h1>
	</header><!-- /header -->
