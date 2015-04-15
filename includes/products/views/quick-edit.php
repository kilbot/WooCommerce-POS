<?php
/**
 * Admin View: Quick Edit Product
 */
if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}
?>

<fieldset class="inline-edit-col-right">
  <div class="inline-edit-col">
    <div class="inline-edit-group">
      <label class="inline-edit-status alignleft">
        <span class="title"><?php _e( 'POS visibility', 'woocommerce-pos' ); ?></span>
        <select>
          <?php
          $options = array_merge(
            array('-1' => '&mdash; No Change &mdash;'), $this->options
          );
          foreach($options as $name => $label){
            echo '<option value="'. $name .'">'. $label .'</option>';
          }
          ?>
        </select>
      </label>
    </div>
  </div>
</fieldset>