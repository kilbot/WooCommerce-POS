<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	<h4 class="modal-title"><?php _e( 'Downloading products', 'woocommerce-pos' ); ?>&hellip;</h4>
</div>
<div class="modal-body">
	<div class="progress" data-total="<%= total %>"></div>
	<p class="small alert alert-info">
	<?= __('WooCommerce POS is storing your products locally.', 'woocommerce-pos'); ?>
	<?= __('This could take some time depending on the number of products you have, the speed of your connection and the speed of your server.', 'woocommerce-pos'); ?>
	<?= __('While you\'re waiting&hellip; why not read over the <a href="http://woopos.com.au/docs" target="_blank">WooCommerce POS documentation</a>.', 'woocommerce-pos'); ?>
	</p>
</div>
<div class="modal-footer" style="display:none;">
	<strong class="pull-left"><?= __('Download complete!', 'woocommerce-pos'); ?></strong>
	<button type="button" class="btn btn-primary" data-dismiss="modal"><?php _e( 'Okay', 'woocommerce-pos' ); ?></button>
</div>
