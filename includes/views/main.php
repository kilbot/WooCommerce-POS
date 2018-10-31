<?php
/**
 * Main POS template
 */
?>
<html class="no-js">
<head>
	<title><?php _e( 'Point of Sale', 'woocommerce-pos' ) ?> - <?php bloginfo( 'name' ) ?></title>
	<meta charset="UTF-8"/>

	<meta name="viewport" content="width=device-width, initial-scale=1"/>
	<meta name="apple-mobile-web-app-capable" content="yes"/>

	<!-- For iPad with high-resolution Retina display running iOS ≥ 7: -->
	<link rel="apple-touch-icon-precomposed" href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-152.png">
	<link rel="apple-touch-icon-precomposed" sizes="152x152"
	      href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-152.png">

	<!-- For iPad with high-resolution Retina display running iOS ≤ 6: -->
	<link rel="apple-touch-icon-precomposed" sizes="144x144"
	      href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-144.png">

	<!-- For iPhone with high-resolution Retina display running iOS ≥ 7: -->
	<link rel="apple-touch-icon-precomposed" sizes="120x120"
	      href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-120.png">

	<!-- For iPhone with high-resolution Retina display running iOS ≤ 6: -->
	<link rel="apple-touch-icon-precomposed" sizes="114x114"
	      href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-114.png">

	<!-- For first- and second-generation iPad: -->
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-72.png">

	<!-- For non-Retina iPhone, iPod Touch, and Android 2.1+ devices: -->
	<link rel="apple-touch-icon-precomposed" href="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-57.png">

	<!-- IE 10 Metro tile icon -->
	<meta name="msapplication-TileColor" content="#323A46">
	<meta name="msapplication-TileImage" content="<?php echo WCPOS\PLUGIN_URL ?>assets/favicon-144.png">

	<link rel="stylesheet" type="text/css" href="https://csstools.github.io/sanitize.css/latest/sanitize.css">
	<style>
		body {
			color: #212121;
			font-family: -apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Helvetica,
			Arial,
			sans-serif,
			'Apple Color Emoji',
			'Segoe UI Emoji',
			'Segoe UI Symbol';
		}

		html, body, #root {
			height: 100%;
		}

		#root {
			display: flex;
			flex-direction: column;
		}
	</style>

	<?php do_action( 'woocommerce_pos_head' ); ?>
</head>
<body>

<div id="root"><i class="icon-pos"></i></div>

<?php do_action( 'woocommerce_pos_footer' ); ?>

<script>
	//if(window.POS){
	//  POS.start('<?php //echo get_woocommerce_api_url(null); ?>//');
	//} else {
	//  alert('<?php //_e('POS assets failed to load', 'woocommerce-pos'); ?>//');
	//}
</script>

</body>
</html>
