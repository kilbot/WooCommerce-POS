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
        <a href="#" class="button" data-action="translation">
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
  </tbody>
</table>