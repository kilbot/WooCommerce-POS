<?php
/**
 * Template for the admin tools
 */
?>

<h3><?php /* translators: woocommerce */
	_e( 'Tools', 'woocommerce' ); ?></h3>

<table class="widefat striped">
	<tbody>

	<tr>
		<th><?php /* translators: woocommerce */
			_e( 'Translation Upgrade', 'woocommerce' ); ?></th>
		<td>
			<a href="#"
			   class="button"
			   data-action="translation"
			   data-title="<?php /* translators: woocommerce */
			   esc_attr_e( 'Translation Upgrade', 'woocommerce' ); ?>"
			>
				<?php
				/* translators: woocommerce */
				_e( 'Force Translation Upgrade', 'woocommerce' );
				?>
			</a>
			<?php
			/* translators: woocommerce */
			_e( '<strong class="red">Note:</strong> This option will force the translation upgrade for your language if a translation is available.', 'woocommerce' );
			?>
		</td>
	</tr>

	<tr>
		<th><?php _e( 'Legacy Server Support', 'woocommerce-pos' ); ?></th>
		<td>
			<?php $toggle = get_option( 'woocommerce_pos_emulateHTTP' ) === '1'; ?>
			<a href="#" data-action="legacy-<?php echo $toggle ? 'disable' : 'enable'; ?>" class="button">
				<?php $toggle ? /* translators: wordpress */
					_e( 'Disable' ) : /* translators: wordpress */
					_e( 'Enable' ); ?>
			</a>
			<?php _e( 'Emulate RESTful HTTP methods to support legacy servers.', 'woocommerce-pos' ); ?>
		</td>
	</tr>

	<tr>
		<th><?php _e( 'Local Data', 'woocommerce-pos' ); ?></th>
		<td>
			<a href="#"
			   class="button"
			   data-action="delete-local-data"
			   data-title="<?php esc_attr_e( 'Clear Local Data', 'woocommerce-pos' ); ?>"
			>
				<?php
				_e( 'Clear All Local Data', 'woocommerce-pos' );
				?>
			</a>
			<?php
			_e( '<strong class="red">Note:</strong> Make sure the POS is not open in another tab.', 'woocommerce-pos' );
			?>
		</td>
	</tr>

	</tbody>
</table>
