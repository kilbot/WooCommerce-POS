<?php
/**
 * Template for the checkout
 */
?>

<script type="text/x-handlebars-template" id="tmpl-checkout-status">
	<?php _e( 'To Pay', 'woocommerce-pos' ); ?>: {{{money total}}}
</script>

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

<script type="text/template" id="tmpl-checkout-actions">
	<a data-action="close" href="#" class="btn"><?php _e( 'Return to Sale', 'woocommerce-pos' ); ?></a>
	<a data-action="process" href="#" class="btn btn-success pull-right"><?php _e( 'Process Payment', 'woocommerce-pos' ); ?></a>
</script>