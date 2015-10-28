<?php
  $status = new WC_POS_Status();
  foreach( $status->output() as $test ):
  $args = wp_parse_args( $test, array(
    'pass' => false,
    'title' => '',
    'message' => '',
    'buttons' => array()
  ) );
  extract( $args );
?>
  <li class="list-row">
    <div class="result">
      <i class="icon-<?php echo $pass ? 'success' : 'error'; ?> icon-lg text-<?php echo $pass ? 'success' : 'error'; ?>"></i>
    </div>
    <div class="title"><?php echo $title; ?></div>
    <div class="message">
      <?php echo $message; ?>
      <?php
      foreach( $buttons as $button ):
        $href = isset( $button['href'] ) ? $button['href'] : '#';
        $action = isset( $button['action'] ) ? 'data-action="'. esc_attr( $button['action'] ) .'"' : '';
        $prompt = isset( $button['prompt'] ) ? $button['prompt'] : '';
      ?>
        <a href="<?php echo esc_url($href); ?>" <?php echo $action; ?> class="btn btn-default"><?php echo $prompt; ?></a>
      <?php endforeach; ?>
    </div>
  </li>
<?php endforeach; ?>

<li class="list-row sub-heading"><div><?php _e( 'Local Storage', 'woocommerce-pos' ); ?></div></li>