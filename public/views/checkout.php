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

		<form>

			<?php  
				// pretend we're guest
				wp_set_current_user( 0 );

				if ( $enabled_gateways = WC_POS()->payment_gateways()->get_enabled_payment_gateways() ) :
					$default_gateway = get_option( 'woocommerce_pos_default_gateway' );
					foreach ( $enabled_gateways as $gateway ) :
						$active = $gateway->id == $default_gateway ? true : false;
			?>

				<fieldset id="<?= $gateway->id; ?>" class="<?php if($active) echo 'active'; ?>">
					<legend>
						<input type="radio" name="payment_method" value="<?= $gateway->id; ?>" <?php if($active) echo 'checked'; ?>> 
						<?php echo $gateway->get_title(); ?> 
						<?php echo $gateway->get_icon(); ?>
					</legend>
					<div class="form-group">
						<?php 
							if( $gateway->has_fields() || $gateway->get_description() ) {
								// remove any javascript
								ob_start();
								$gateway->payment_fields();
								$html = ob_get_contents();
								ob_end_clean();
								$doc = new DOMDocument();
								$doc->loadHTML($html);
								$script_tags = $doc->getElementsByTagName('script');
								$length = $script_tags->length;
								for ($i = 0; $i < $length; $i++) {
									$script_tags->item($i)->parentNode->removeChild($script_tags->item($i));
								}
								echo $doc->saveHTML();
							}
						?>
					</div>
				</fieldset>

			<?php 
					endforeach;

				else :
					// no payment gateways enabled
					echo '<p>' . __( 'No payment gateways enabled.', 'woocommerce-pos' ) . '</p>';
				endif;

				// back to being logged in
				wp_set_current_user( WC_POS()->logged_in_user->ID );
			?>
			
		</form>	

	</div>
	<div id="checkout-actions" class="action-btns">

		<button class="btn action-close pull-left"><?php _e( 'Return to Sale', 'woocommerce-pos' ); ?></button>
		<button class="btn btn-success action-process"><?php _e( 'Process Payment', 'woocommerce-pos' ); ?></button>

	</div>
</script>