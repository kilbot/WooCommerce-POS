<!DOCTYPE html>
<html lang="en-US">
<head>
	<meta charset="UTF-8" />
	<title>Point of Sale - <?php bloginfo('name') ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<link rel="stylesheet" href="//code.jquery.com/mobile/1.4.0/jquery.mobile-1.4.0.min.css" type="text/css" media="all" />
	<link rel="stylesheet" href="<?= plugins_url( 'woocommerce-pos/public/assets/css/pos.css' ) ?>" type="text/css" media="all" />
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript">
	$(document).bind("mobileinit", function () {
	    $.mobile.ajaxEnabled = false;
	});
	</script>
	<script src="//code.jquery.com/mobile/1.4.0/jquery.mobile-1.4.0.min.js"></script>
	
	<!-- DataTables -->
	<link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css">
	<script type="text/javascript" charset="utf8" src="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"></script>

</head>
<body>
<div data-role="page">
	<div data-theme="b" data-role="header">
		<a href="#nav" data-icon="bars">Menu</a>
		<h1>Point of Sale - <?php bloginfo('name') ?></h1>
		<a href="">Howdy, <?php global $current_user; get_currentuserinfo(); echo $current_user->display_name ?></a>
	</div><!-- /header -->