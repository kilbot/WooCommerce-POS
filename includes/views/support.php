<?php
/**
 * Template for the support page
 */

// using global user info
global $current_user;

?>

<script type="text/x-handlebars-template" id="tmpl-support-form" data-title="<?php _e( 'Support Form', 'woocommerce-pos' ); ?>">
  <li>
    <div class="label"><?php /* translators: wordpress */ _e( 'Name' ); ?>:</div>
    <div class="input" data-name="name" contenteditable><?php
    if( $current_user->first_name != '' || $current_user->last_name != '' ){
      echo $current_user->first_name .' '. $current_user->last_name;
    } else {
      echo $current_user->display_name;
    }
    ?></div>
  </li>
  <li class="form-group">
    <div class="label"><?php /* translators: wordpress */ _e( 'Email' ); ?>:</div>
    <div class="input" data-name="email" contenteditable><?php echo $current_user->user_email ?></div>
  </li>
  <li class="form-group">
    <div class="label"><?php /* translators: wordpress */ _e( 'Message' ); ?>:</div>
    <div class="input" data-name="message" placeholder="<?php _e('Describe your problem here ...', 'woocommerce-pos') ?>" contenteditable></div>
  </li>
  <li class="no-border">
    <div>
      <small><label><input type="checkbox" name="reports[]" value="pos" checked="checked"> <?php _e( 'Append POS system report', 'woocommerce-pos' ); ?></label></small> <a href="#" class="toggle"><i class="icon-info-circle"></i></a>
      <textarea class="form-control" id="pos_status" name="pos_status" class="small" style="display:none" readonly>Shop URL: <?php echo get_bloginfo('url')."\n"; ?></textarea>
    </div>
  </li>
</script>