<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	<h4 class="modal-title"><?php _e( 'Email Receipt', 'woocommerce-pos' ); ?></h4>
</div>
<div class="modal-body">
	<% if( result === 'success' ) { %>
		<%= message %>
	<% } else { %>
		<input class="form-control" type="email" id="email" name="email" value="" placeholder="<?php _e( 'Email Address', 'woocommerce-pos') ?>" required="required" />
		<%= message %>
	<% } %>
</div>
<div class="modal-footer">
	<% if( result === 'success' ) { %>
		<button type="button" class="btn btn-primary action-close" data-dismiss="modal"><?php _e( 'Close', 'woocommerce-pos' ); ?></button>
	<% } else { %>
		<button type="button" class="btn btn-primary action-send" data-dismiss="modal"><?php _e( 'Send', 'woocommerce-pos' ); ?></button>
	<% } %>
</div>
