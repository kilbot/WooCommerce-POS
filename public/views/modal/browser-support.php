<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	<h4 class="modal-title"><?php _e( 'Your browser is not supported!', 'woocommerce-pos' ); ?></h4>
</div>
<div class="modal-body">
	<p>
	<?= __('Sorry, it seems your browser is not currently supported by WooCommerce POS. '); ?>
	<?= __('If possible, please <a href="http://browsehappy.com/">update your browser</a>, we recommend either Chrome or Firefox.'); ?>
	</p>
	<p>
	<?= __('If you believe you have received this message in error please contact support at <a href="http://woopos.com.au">woopos.com.au</a>'); ?>
	</p>
</div>
<div class="modal-footer">
	<button type="button" class="btn btn-primary" data-dismiss="modal"><?php _e( 'Okay', 'woocommerce-pos' ); ?></button>
</div>