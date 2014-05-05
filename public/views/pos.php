<?php include_once( 'header.php' ); ?>

<main id="main" class="site-main" role="main">
	<section class="col leftcol">
	
		<div id="filter"><i class="fa fa-search"></i></div>
		<div id="products"><img class="loading" src="<?= WC_POS()->plugin_url ?>/assets/ajax-loader.gif" alt="loading ..."></div>
		<div id="pagination"></div>

	</section><!-- /left col --> 

	<section class="col rightcol">  

		<div id="cart"></div>

		<?php
		global $woocommerce;
		error_log( print_R( $woocommerce->cart->get_cart(), TRUE ) ); //debug

		error_log( 'Cart Subtotal: ' . $woocommerce->cart->get_cart_subtotal() ); //debug
		// error_log( 'Cart Total: ' . $woocommerce->cart->get_cart_total() ); //debug
		error_log( 'Tax: ' . $woocommerce->cart->get_cart_tax() ); //debug
		error_log( 'Discount: ' . $woocommerce->cart->get_total_discount() ); //debug
		error_log( 'Total: ' . $woocommerce->cart->get_total() ); //debug

		?>

	</section><!-- /right col -->
</main><!-- /main -->
	
<?php include_once( 'footer.php' ); ?>