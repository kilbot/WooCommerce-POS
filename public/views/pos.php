<?php include_once( 'header.php' ); ?>

<main id="main" class="site-main" role="main">
	<section class="col leftcol">
	
		<div id="filter"><i class="fa fa-search"></i></div>
		<div id="products"><img class="loading" src="<?= WC_POS()->plugin_url ?>/assets/ajax-loader.gif" alt="loading ..."></div>
		<div id="pagination"></div>

	</section><!-- /left col --> 

	<section class="col rightcol">  

		<div id="cart"></div>

	</section><!-- /right col -->
</main><!-- /main -->
	
<?php include_once( 'footer.php' ); ?>