<?php 
/**
 * Template for the checkout
 */
?>

<script type="text/template" id="tmpl-checkout">

	<div id="checkout-status" class="status">
		<h4 class="text-center">
			<?php _e( 'To Pay', 'woocommerce-pos' ); ?>:
			{{{money total}}}
		</h4>
	</div>

	<div id="checkout-gateways">

		<div class="panel-group" id="payment-options">

			<?php  
				// pretend we're guest
				wp_set_current_user( 0 );

				if ( $enabled_gateways = WC_POS()->payment_gateways()->get_enabled_payment_gateways() ) :
					$default_gateway = get_option( 'woocommerce_pos_default_gateway' );
					foreach ( $enabled_gateways as $gateway ) :
			?>

			<form class="panel panel-<?= $gateway->id == $default_gateway ? 'success' : 'default' ; ?> payment_method_<?= $gateway->id; ?>">
				<div class="panel-heading" data-toggle="collapse" data-target="#payment_box_<?= $gateway->id; ?>" data-parent="#payment-options">
					<h5 class="panel-title">
						<input type="hidden" name="payment_method" value="<?= $gateway->id; ?>"> 
						<?php echo $gateway->get_title(); ?> 
						<?php echo $gateway->get_icon(); ?>
					</h5>
				</div>
				<div id="payment_box_<?= $gateway->id; ?>" class="panel-collapse collapse <?= $gateway->id == $default_gateway ? 'in' : '' ; ?>">
					<div class="panel-body">
						<?php 
							if( $gateway->has_fields() || $gateway->get_description() ) 
								$gateway->payment_fields(); 
						?>
					</div>
				</div>
			</form>

			<?php 
					endforeach;

				else :
					// no payment gateways enabled
					echo '<p>' . __( 'No payment gateways enabled.', 'woocommerce-pos' ) . '</p>';
				endif;

				// back to being logged in
				wp_set_current_user( WC_POS()->logged_in_user->ID );
			?>
		</div>	

	</div>
	<div id="checkout-actions" class="action-btns">

		<button class="btn action-close pull-left"><?php _e( 'Return to Sale', 'woocommerce-pos' ); ?></button>
		<button class="btn btn-success action-process"><?php _e( 'Process Payment', 'woocommerce-pos' ); ?></button>

	</div>
</script>