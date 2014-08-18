<?php include_once( 'header.php' ); ?>

<main id="main" class="site-main" role="main">
	
	<section id="support-form" class="col leftcol">
		<h4><?php _e( 'POS Support Form', 'woocommerce-pos' ); ?></h4>
		<?php if( WC_POS()->support->support_form() ): ?>
		<form method="post" action="./">
			<fieldset class="form-group">
				<label for="name"><?php _e( 'Name', 'woocommerce-pos' ); ?>:</label>
				<input class="form-control" type="text" id="name" name="name" value="<?= $current_user->display_name ?>" placeholder="<?php _e( 'Your name', 'woocommerce-pos') ?>" required="required" />
			</fieldset>
			<fieldset class="form-group">
				<label for="email"><?php _e( 'Email', 'woocommerce-pos' ); ?>:</label>
				<input class="form-control" type="email" id="email" name="email" value="<?= $current_user->user_email ?>" placeholder="<?php _e( 'Your email', 'woocommerce-pos') ?>" required="required" />
			</fieldset>
			<fieldset class="form-group">
				<label for="message"><?php _e( 'Message', 'woocommerce-pos' ); ?>:</label>
				<textarea class="form-control" id="message" name="message" placeholder="<?php _e('Describe your problem here ...', 'woocommerce-pos') ?>" required="required"></textarea>
			</fieldset>
			<fieldset class="no-border">
				<small><label><input type="checkbox" name="reports[]" value="pos" checked="checked"> <?php _e( 'Append POS system report', 'woocommerce-pos' ); ?></label></small> <a href="#" class="toggle"><i class="fa fa-info-circle"></i></a>
				<textarea class="form-control" id="pos_status" name="pos_status" readonly="readonly" class="small" style="display:none">Shop URL: <?= get_bloginfo('url')."\n"; ?></textarea>
			</fieldset>
			<fieldset class="actions text-right">
				<?php wp_nonce_field('email_support', 'email_support_nonce'); ?>
				<button type="submit" name="email-support" id="email-support" class="btn btn-primary alignright"><?php _e( 'Send', 'woocommerce-pos' ); ?></button>
			</fieldset>
		</form>
		<?php else: ?>
			<p class="panel-body">
				<strong><?php _e( 'Thank you!', 'woocommerce-pos' ); ?></strong> 
				<?php _e( 'Your form has been sent', 'woocommerce-pos' ); ?>. 
				<?php _e( 'We will get back to you as soon as possible', 'woocommerce-pos' ); ?>.
			</p>
		<?php endif; ?>
	</section><!-- /left col --> 

	<section id="system-status" class="col rightcol"> 
		<h4><?php _e( 'POS System Status', 'woocommerce-pos' ); ?></h4>
		<table class="table">
			<tbody>
				<?php WC_POS()->support->pos_status(); ?>
			</tbody>
		</table>
	</section><!-- /right col -->

</main><!-- /main -->

<?php include_once( 'footer.php' ); ?>