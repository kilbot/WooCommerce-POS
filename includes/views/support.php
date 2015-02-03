<?php
/**
 * Template for the support page
 */

// using global user info
global $current_user;

?>

<script type="text/x-handlebars-template" id="tmpl-support-form">
  <h4><?php _e( 'Support Form', 'woocommerce-pos' ); ?></h4>
  <form>
    <fieldset class="form-group">
      <label for="name"><?php /* translators: wordpress */ _e( 'Name' ); ?>:</label>
      <input class="form-control" type="text" id="name" name="name" value="<?php
        if( $current_user->first_name != '' || $current_user->last_name != '' ){
          echo $current_user->first_name .' '. $current_user->last_name;
        } else {
          echo $current_user->display_name;
        }
      ?>" placeholder="<?php _e( 'Your name', 'woocommerce-pos' ) ?>" required="required" />
    </fieldset>
    <fieldset class="form-group">
      <label for="email"><?php /* translators: wordpress */ _e( 'Email' ); ?>:</label>
      <input class="form-control" type="email" id="email" name="email" value="<?php echo $current_user->user_email ?>" placeholder="<?php _e( 'Your email', 'woocommerce-pos') ?>" required="required" />
    </fieldset>
    <fieldset class="form-group">
      <label for="message"><?php /* translators: wordpress */ _e( 'Message' ); ?>:</label>
      <textarea class="form-control" id="message" name="message" placeholder="<?php _e('Describe your problem here ...', 'woocommerce-pos') ?>" required="required"></textarea>
    </fieldset>
    <fieldset class="no-border">
      <small><label><input type="checkbox" name="reports[]" value="pos" checked="checked"> <?php _e( 'Append POS system report', 'woocommerce-pos' ); ?></label></small> <a href="#" class="toggle"><i class="icon icon-info-circle"></i></a>
      <textarea class="form-control" id="pos_status" name="pos_status" class="small" style="display:none" readonly>Shop URL: <?php echo get_bloginfo('url')."\n"; ?></textarea>
    </fieldset>
    <fieldset class="actions text-right">
      <button type="submit" name="email-support" id="email-support" class="btn btn-primary alignright"><?php /* translators: wordpress */ _e( 'Submit' ); ?></button>
    </fieldset>
  </form>
</script>

<script type="text/x-handlebars-template" id="tmpl-pos-status">
  <h4><?php /* translators: woocommerce-admin */ _e( 'System Status', 'woocommerce-admin' ); ?></h4>
  <table class="table">
    {{#each []}}
      {{#if test}}
        <tr class="pass"><td><i class="icon icon-check"></i></td><td>{{title}}</td><td colspan="2">{{{pass}}}</td></tr>
      {{else}}
        <tr class="fail">
          <td><i class="icon icon-times"></i></td><td>{{title}}</td><td>{{{fail}}}</td>
          {{#if action}}<td><a class="btn btn-primary" href="{{action}}">{{{prompt}}}</a></td>{{/if}}
        </tr>
      {{/if}}
    {{/each}}
  </table>
</script>