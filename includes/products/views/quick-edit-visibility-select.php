<?php
/**
 * Admin View: Quick Edit Product
 */
if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}
?>

<fieldset class="inline-edit-col-left">
  <div class="inline-edit-col">
    <div class="inline-edit-group">
      <label class="inline-edit-status alignleft">
        <span class="title"><?php _e( 'POS visibility', 'woocommerce-pos' ); ?></span>
        <select name="_pos_visibility">
          <?php
          foreach($options as $name => $label){
            echo '<option value="'. $name .'">'. $label .'</option>';
          }
          ?>
        </select>
      </label>
    </div>
  </div>
</fieldset>