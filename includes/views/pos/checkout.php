<?php
/**
 * Template for the checkout
 */
?>

<?php
	$gateways = $this->gateways();
	if($gateways): foreach( $gateways as $gateway ):
?>
<script
	type="text/x-handlebars-template"
	class="tmpl-checkout-gateways"
	data-gateway="<?php echo $gateway->id; ?>"
	data-title="<?php echo esc_html( $gateway->get_title() ); ?>"
	data-icon="<?php echo $this->sanitize_icon( $gateway ); ?>"
	data-default="<?php echo $gateway->default; ?>"
>
	<?php echo $this->sanitize_payment_fields( $gateway ); ?>
</script>
<?php endforeach; endif; ?>

<script type="text/template" id="tmpl-checkout-gateways-empty">
	<p><?php _e( 'No payment gateways enabled.', 'woocommerce-pos' ); ?></p>
</script>