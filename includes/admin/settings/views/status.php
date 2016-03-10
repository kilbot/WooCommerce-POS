<?php
/**
 * Template for the admin tools
 */

use WC_POS\Status;

?>

<h3><?php /* translators: woocommerce */ _e( 'System Status', 'woocommerce' ); ?></h3>

<table class="widefat striped">
  <tbody>
    <?php
      $status = new Status();
      foreach( $status->output() as $test ):
      $args = wp_parse_args( $test, array(
        'pass' => false,
        'title' => '',
        'message' => '',
        'buttons' => array()
      ) );
      extract( $args );
    ?>
    <tr>
      <th style="width:25%"><?php echo $title; ?></th>
      <td style="width:10%;text-align:center;" class="<?php echo $pass ? 'pass' : 'fail'; ?>">
        <i class="wc_pos-text-<?php echo $pass ? 'success' : 'error'; ?> wc_pos-icon-<?php echo $pass ? 'success' : 'error'; ?> wc_pos-icon-lg"></i>
      </td>
      <td>
        <?php echo $message; ?>
        <?php
        foreach( $buttons as $button ):
          $href = isset( $button['href'] ) ? $button['href'] : '#';
          $action = isset( $button['action'] ) ? 'data-action="'. esc_attr( $button['action'] ) .'"' : '';
          $prompt = isset( $button['prompt'] ) ? $button['prompt'] : '';
          ?>
          <a href="<?php echo esc_url($href); ?>" <?php echo $action; ?> class="button"><?php echo $prompt; ?></a>
        <?php endforeach; ?>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
