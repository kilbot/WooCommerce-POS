<!DOCTYPE html>
<html lang="en-US">
<head>
	<meta charset="UTF-8" />
	<title>Point of Sale - <?php bloginfo('name') ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<?php WooCommerce_POS::pos_print_css(); ?>
	<?php WooCommerce_POS::pos_print_js_head(); ?>
	
</head>
<body>
<div data-role="page">
	<div data-theme="b" data-role="header">
		<a href="#nav" data-icon="bars">Menu</a>
		<h1>Point of Sale - <?php bloginfo('name') ?></h1>
		<a href="">Howdy, <?php global $current_user; get_currentuserinfo(); echo $current_user->display_name ?></a>
	</div><!-- /header -->