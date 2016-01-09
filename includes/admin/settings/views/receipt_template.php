<?php
  /**
   * Template for the receipts settings
   */
?>

<h3><?php _e( 'Receipt Template', 'woocommerce-pos' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="customer_roles"><?php _e( 'Receipt Template', 'woocommerce-pos' ) ?></label>
    </th>
    <td>
      <p>
        <?php
          $template_path = 'yadda yadda';
          printf( __( '<strong class="red">Template path:</strong> %s', 'woocommerce-pos' ), '<code style="font-size: 11px">'. $template_path .'</code>' );
        ?>
      </p>
      <a href="#" class="button" data-action="preview-receipt">
        <?php _e( 'View Sample Receipt', 'woocommerce-pos' ); ?>
      </a>
    </td>
  </tr>

  <tr>
    <td colspan="2" id="receipt-preview" style="display:none;"></td>
  </tr>

</table>