<?php include_once( 'footer.php' ); ?>


<?php include_once( 'header.php' ); ?>

<main id="main" class="site-main" role="main">
	<section class="col leftcol">
	
		<?php include_once( 'view-order.php' ); ?>

	</section><!-- /left col --> 

	<section class="col rightcol">  

		<form action="/pos/" method="post" accept-charset="utf-8">
			<input type="text" name="email" value="" id="email">
			<input type="submit" name="email_receipt" value="Email Receipt" id="email_receipt">
		</form>
		
		<a data-role="button" data-theme="g" href="/pos/">Back to Point of Sale</a>

	</section><!-- /right col -->
</main><!-- /main -->
	
<?php include_once( 'footer.php' ); ?>