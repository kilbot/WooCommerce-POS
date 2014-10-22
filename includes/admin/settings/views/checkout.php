<?php
/**
 * Template for the checkout settings
 */
?>

<script id='tmpl-wc-pos-settings-checkout' type='text/html'>

	<h3><?= __( 'Payment Gateways', 'woocommerce-pos' ); ?></h3>

	<p>
		<?= __( 'Installed gateways are listed below. Drag and drop gateways to control their display order at the Point of Sale. ', 'woocommerce-pos' ); ?>
		<br>
		<?= __( 'Payment Gateways enabled here will be available at the Point of Sale. Payment Gateways enabled on the settings page will be available in your Online Store. ', 'woocommerce-pos' ); ?>
	</p>

	<p class="woocommerce-pos-warning">
		<?= __( 'It is your responsibility to ensure the security of your customer\'s information. Transmitting credit card or other sensitive information should only be done using a secure connnection. For more information please visit <a href="http://woopos.com.au/docs/security">http://woopos.com.au/docs/security</a>', 'woocommerce-pos' ); ?>
	</p>

	<table>
		<tr valign="top">
			<th scope="row" class="titledesc">
				Another example:
			</th>
			<td>
				<input name="wc_pos_settings_checkout[example]" type="text" />
			</td>
		</tr>
	</table>

</script>