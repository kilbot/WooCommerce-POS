<?php 
/**
 * Template for the checkout
 */
?>

<script type="text/template" id="tmpl-checkout">
	<div>
		<h4><?php _e( 'Payment', 'woocommerce-pos' ); ?></h4>
	</div>
	<div id="checkout-status"></div>
	<div id="checkout-payment"></div>
	<div id="checkout-actions"></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-checkout-status">
	<h4 class="textcenter">
		<span class="status">
			<?php _e( 'To Pay', 'woocommerce-pos' ); ?>:
			<?php _e( 'Processing', 'woocommerce-pos' ); ?>:
			<i class="fa fa-check"></i> <?php _e( 'Paid', 'woocommerce-pos' ); ?>:
		</span>
		<span class="amount">{{{money total}}}</span>
	</h4>
</script>

<script type="text/x-handlebars-template" id="tmpl-checkout-payment">
	<div class="panel-group" id="payment-options">

		<?php  
			if ( $enabled_gateways = WC_POS()->payment_gateways()->get_enabled_payment_gateways() ) :
				$default_gateway = get_option( 'woocommerce_pos_default_gateway' );
				foreach ( $enabled_gateways as $gateway ) :
		?>

		<div class="panel panel-<?= $gateway->id == $default_gateway ? 'success' : 'default' ; ?> payment_method_<?= $gateway->id; ?>">
			<div class="panel-heading">
				<h5 data-toggle="collapse" data-target="#payment_box_<?= $gateway->id; ?>" data-parent="#payment-options" class="panel-title">
					<input type="hidden" name="<?= $gateway->id; ?>">
					<i class="fa fa-square-o"></i><i class="fa fa-check-square-o"></i> 
					<?php echo $gateway->get_title(); ?> 
					<?php echo $gateway->get_icon(); ?>
				</h5>

			</div>
			<?php if ( $gateway->has_fields() || $gateway->get_description() ): ?>
			<div id="payment_box_<?= $gateway->id; ?>" class="panel-collapse collapse <?= $gateway->id == $default_gateway ? 'in' : '' ; ?>">
				<div class="panel-body">
					<?php $gateway->payment_fields(); ?>
				</div>
			</div>
			<?php endif; ?>
		</div>

		<?php 
				endforeach;
			else :
				// no payment gateways enabled
				echo '<p>' . __( 'No payment gateways enabled.', 'woocommerce-pos' ) . '</p>';
			endif;
		?>
	</div>		
</script>

<script type="text/template" id="tmpl-checkout-actions">
	<button class="btn action-close pull-left"><?php _e( 'Return to Sale', 'woocommerce-pos' ); ?></button>
	<button class="btn btn-success action-process"><?php _e( 'Process Payment', 'woocommerce-pos' ); ?></button>
</script>