<h3><?php _e( 'Keyboard Shortcuts', 'woocommerce-pos' ); ?></h3>

<p>
  <?php _e( 'You can trigger certain events in WooCommerce POS using keyboard shortcuts (HotKeys).', 'woocommerce-pos' ); ?><br>
  <?php _e( 'HotKeys can also be used as a prefix for your barcode scanner or card reader.', 'woocommerce-pos' ); ?><br>
  <?php printf( __( 'For more information please visit <a href="%1$s" target="_blank">%1$s</a>', 'woocommerce-pos' ), 'http://woopos.com.au/docs/hotkeys' ); ?>
</p>

<ul class="wc-pos-hotkeys">
  <?php $keys = $this->get('hotkeys'); if($keys): foreach($keys as $id => $key): ?>
    <li>
      <input type="text" name="hotkeys.<?php echo $id?>.key">
      <label for="hotkeys.<?php echo $id?>.key"><?php echo $key['label']?></label>
    </li>
  <?php endforeach; endif; ?>
</ul>