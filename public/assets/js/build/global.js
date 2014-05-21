/**
 * 
 */

(function ( $ ) {
	'use strict';

	/*============================================================================
	 UI init
	 ===========================================================================*/ 
	
	// put focus on the search
	$('#filter input[type=search]').focus();

	/*============================================================================
	 Check browser support
	 ===========================================================================*/ 
	if( !Modernizr.indexeddb && !Modernizr.websqldatabase ) {

		var init = $('<div class="modal fade"><div class="modal-dialog"><div class="modal-content">Hi!</div></div></div>');

		$.get( pos_cart_params.ajax_url , { action: 'pos_get_modal', template: 'browser-support' } )
		.done(function( data ) {
			init.modal('show').find('.modal-content').html(data);
		});

	}


}(jQuery));