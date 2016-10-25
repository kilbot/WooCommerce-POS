<?php
/**
 * Admin View: Variation Metabox
 */
if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}
?>

<div>
  <p class="form-row form-row-full">
    <label for="variable_pos_visibility[<?php echo $variation->ID; ?>]"><?php _e( 'POS visibility', 'woocommerce-pos' ); ?></label>
    <select name="variable_pos_visibility[<?php echo $variation->ID; ?>]">
      <?php foreach($this->options as $value => $label): $select = $value == $selected ? 'selected="selected"' : ''; ?>
        <option value="<?php echo $value; ?>" <?php echo $select; ?>> <?php echo $label; ?> </option>
      <?php endforeach; ?>
    </select>
  </p>
</div>