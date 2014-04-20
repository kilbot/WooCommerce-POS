<?php include_once( 'header.php' ); ?>

<div data-role="content" style="padding:0;">
	<div class="col leftcol">

		<?php include_once( 'review-order.php' ); ?>

	</div><!-- /left col --> 

	<div class="col rightcol">  
	
		Payment Options:

		<form action="/pos/" method="post" accept-charset="utf-8">
			<input type="submit" name="cash" value="Cash" id="cash">
			<input type="submit" name="card" value="Card" id="card">
			<input type="hidden" name="pos_receipt" value="Proceed to Receipt">
			<?php wp_nonce_field( 'woocommerce-process_checkout' ); ?>
			<?php wp_nonce_field('checkout','woocommerce-pos_receipt',false); ?>
		</form>

	</div><!-- /right col -->
</div><!-- /content -->
	
<?php include_once( 'menu.php' ); ?>

<?php include_once( 'footer.php' ); ?>