<p class="form-field form-field-wide">
  <label for="wc_pos_order_type"><?php _e( 'Order type', 'woocommerce-pos' ) ?>:</label>
  <select id="wc_pos_order_type" name="wc_pos_order_type" class="wc-enhanced-select">
    <option value="0" <?php selected( $this->pos_order, false, true); ?>><?php _e('Online', 'woocommerce-pos'); ?></option>
    <option value="1" <?php selected( $this->pos_order, true, true); ?>><?php _e('POS', 'woocommerce-pos'); ?></option>
  </select>
</p>
