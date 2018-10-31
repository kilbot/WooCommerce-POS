<h3><?php _e( 'Keyboard Shortcuts', 'woocommerce-pos' ); ?></h3>

<p>
	<?php _e( 'You can trigger certain events in WooCommerce POS using keyboard shortcuts (HotKeys).', 'woocommerce-pos' ); ?>
	<br>
	<?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), wcpos_doc_url( 'hotkeys.html' ) ); ?>
</p>

<ul class="wc_pos-hotkeys">
	<?php $keys = $this->get( 'hotkeys' );
	if ( $keys ): foreach ( $keys as $id => $key ): ?>
		<li>
			<input type="text" name="hotkeys.<?php esc_attr_e( $id ); ?>.key">
			<label for="hotkeys.<?php esc_attr_e( $id ); ?>.key"><?php echo $key['label']; ?></label>
		</li>
	<?php endforeach; endif; ?>
</ul>
