<?php
/**
 * Template for the checkout
 */
?>

<?php
	$gateways = $this->gateways->enabled_gateways();
	if($gateways): foreach( $gateways as $gateway ):
?>
<script
	type="text/x-handlebars-template"
	class="tmpl-checkout-gateways"
	data-gateway="<?php echo $gateway->id; ?>"
	data-title="<?php echo $gateway->title; ?>"
	data-icon="<?php echo $gateway->icon; ?>"
	data-default="<?php echo $gateway->default; ?>"
>
	<div class="form-group">
		<?php echo $gateway->payment_fields; ?>
	</div>
</script>
<?php endforeach; endif; ?>

<script type="text/template" id="tmpl-checkout-gateways-empty">
	<p><?php _e( 'No payment gateways enabled.', 'woocommerce-pos' ); ?></p>
</script>