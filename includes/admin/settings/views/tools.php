<?php
/**
 * Template for the admin tools
 */
?>

<h3><?php /* translators: woocommerce */ _e( 'Tools', 'woocommerce' ); ?></h3>

<table class="widefat">
  <tbody>

    <tr>
      <th><?php /* translators: woocommerce */ _e( 'Translation Upgrade', 'woocommerce' ); ?></th>
      <td>
        <a href="#"
           class="button"
           data-action="translation"
           data-title="<?php /* translators: woocommerce */ _e( 'Translation Upgrade', 'woocommerce' ); ?>"
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
      <th><?php _e( 'Receipt Template', 'woocommerce-pos' ); ?></th>
      <td>
        <a href="<?php echo wc_pos_url('#print'); ?>" target="_blank" class="button">
          <?php _e( 'View Sample Receipt', 'woocommerce-pos' ); ?>
        </a>
        <?php printf( __( '<strong class="red">Template path:</strong> %s', 'woocommerce-pos' ), '<code style="font-size: 11px">'. wc_pos_locate_template('print/receipt.php') .'</code>' ); ?>
      </td>
    </tr>

  </tbody>
</table>