<?php include_once( 'header.php' ); ?>

<div data-role="content" style="padding:0;">
	<div class="col leftcol">

		<?php include_once( 'view-order.php' ); ?>

	</div><!-- /left col --> 

	<div class="col rightcol">  

		<form action="/pos/" method="post" accept-charset="utf-8">
			<input type="text" name="email" value="" id="email">
			<input type="submit" name="email_receipt" value="Email Receipt" id="email_receipt">
		</form>
		
		<a data-role="button" data-theme="g" href="/pos/">Back to Point of Sale</a>

	</div><!-- /right col -->
</div><!-- /content -->
	
<?php include_once( 'menu.php' ); ?>

<?php include_once( 'footer.php' ); ?>