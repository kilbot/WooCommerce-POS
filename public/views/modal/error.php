<div class="modal">
	<div class="modal-dialog">
	    <div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title"><?php _e( 'Error', 'woocommerce-pos' ); ?></h4>
			</div>
			<div class="modal-body"></div>
			<div class="modal-footer">
				<button type="button" class="btn btn-primary" data-dismiss="modal"><?php _e( 'Okay', 'woocommerce-pos' ); ?></button>
			</div>
		</div>
	</div>
	<script type="text/javascript">
	var error = {
		'404': '<?= sprintf( __( 'Error connecting to the REST API. Please check the <a href="%s">POS System Status</a>.', 'woocommerce-pos' ), WC_POS()->pos_url('support') ); ?>',
		'': '<?= __( 'Oh no ... there has been an error :(', 'woocommerce-pos' ) ?><br><?= sprintf( __( 'Please report the problem via the <a href="%s">Support</a> page.', 'woocommerce-pos' ), WC_POS()->pos_url('support') ); ?>',
	}
	</script>
</div>