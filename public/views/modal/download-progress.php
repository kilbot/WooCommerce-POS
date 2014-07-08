<div class="modal" id="download-progress">
	<div class="modal-dialog">
	    <div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title"><?php _e( 'Downloading products', 'woocommerce-pos' ); ?>&hellip;</h4>
			</div>
			<div class="modal-body">
				<div class="progress-bar" data-total="<?= isset( $total ) ? $total : 1 ; ?>">
					<span class="working"></span><em></em>
				</div>
				<p class="small alert alert-info">
				<?= __('WooCommerce POS is storing your products locally.', 'woocommerce-pos'); ?>
				<?= __('This could take some time depending on the number of products you have, the speed of your connection and the speed of your server.', 'woocommerce-pos'); ?>
				<?= __('While you\'re waiting&hellip; why not read over the <a href="http://woopos.com.au/docs" target="_blank">WooCommerce POS documentation</a>.', 'woocommerce-pos'); ?>
				</p>

			</div>
			<div class="modal-footer" style="display:none;">
				<strong class="alignleft"><?= __('Download complete!', 'woocommerce-pos'); ?></strong>
				<button type="button" class="btn btn-primary" data-dismiss="modal"><?php _e( 'Okay', 'woocommerce-pos' ); ?></button>
			</div>
		</div>
	</div>
	<script type="text/javascript">
		var bar = $('#download-progress .progress-bar');
		bar.on('changeData', function() {
			var count = $(this).data('count'),
				total = $(this).data('total'),
				width = ( count / total ) * 100;
				if( width < 1 ) width = 1;
			$(this).children('em').text(count + ' / ' + total);
			$(this).children('span').css('width', width + '%')
			if( count === total ) {
				$('#download-progress .modal-footer').show();
				$(this).children('span').removeClass('working');
			}
		});
		bar.data('count', 0).trigger('changeData');

		// teardown
		$('#download-progress').on('hidden.bs.modal', function (e) { $(this).remove(); });
	</script>
</div>