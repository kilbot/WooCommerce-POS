<?php
/**
 * Template for the checkout settings
 */
?>

<h3><?= __( 'Payment Gateways', 'woocommerce-pos' ); ?></h3>

<p>
	<?= __( 'Installed gateways are listed below. Drag and drop gateways to control their display order at the Point of Sale. ', 'woocommerce-pos' ); ?><br>
	<?= __( 'Payment Gateways enabled here will be available at the Point of Sale. Payment Gateways enabled on the settings page will be available in your Online Store. ', 'woocommerce-pos' ); ?>
</p>

<p class="update-nag" style="font-size:13px;margin:0;">
	<?= __( 'It is your responsibility to ensure the security of your customer\'s information. Transmitting credit card or other sensitive information should only be done using a secure connnection. For more information please visit <a href="http://woopos.com.au/docs/security">http://woopos.com.au/docs/security</a>', 'woocommerce-pos' ); ?>
</p>

<table class="form-table">

	<tr>
		<th scope="row"><?php _e( 'Gateway Display', 'woocommerce-pos' ) ?></th>
		<td>
			<table class="wc-gateways widefat sortable" cellspacing="0">
				<thead>
					<tr>
						<th scope="col"><?= __( 'Default', 'woocommerce-pos' ) ?></th>
						<th class="gateway-name" scope="col"><?= __( 'Gateway', 'woocommerce-pos' ) ?></th>
						<th class="gateway-id" scope="col"><?= __( 'Gateway ID', 'woocommerce-pos' ) ?></th>
						<th scope="col"><?= __( 'Online Status', 'woocommerce-pos' ) ?></th>
						<th scope="col"><?= __( 'POS Status', 'woocommerce-pos' ) ?></th>
						<th scope="col"><?= __( 'Settings', 'woocommerce-pos' ) ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( WC()->payment_gateways->payment_gateways() as $gateway ) : ?>
						<tr>
							<td>
								<input type="radio" name="default_gateway" value="<?= esc_attr( $gateway->id ) ?>" />
								<input type="hidden" name="gateway_order[<?= $gateway->id ?>]" />
							</td>
							<td class="gateway-name"><?= $gateway->get_title() ?></td>
							<td class="gateway-id"><?= esc_html( $gateway->id ) ?></td>
							<td>
								<?php if ( $gateway->enabled == 'yes' ): ?>
								<span class="status-enabled" data-toggle="tooltip" title="<?= __ ( 'Enabled', 'woocommerce-pos' ); ?>"></span>
								<?php else: echo '-'; endif; ?>
							</td>
							<td></td>
							<td><a class="button" href="<?= admin_url( 'admin.php?page=wc-settings&tab=checkout&section=' . strtolower( get_class( $gateway ) ) ) ?>"><?= __( 'Settings', 'woocommerce-pos' ) ?></a></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</td>
	</tr>

</table>