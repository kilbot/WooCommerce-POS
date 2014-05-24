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
	if( !Modernizr.indexeddb ) {

		var init = $('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"></div></div></div>');

		$.get( pos_cart_params.ajax_url , { action: 'pos_get_modal', template: 'browser-support' } )
		.done(function( data ) {
			init.modal('show').find('.modal-content').html(data);
		});

	}


}(jQuery));


/**
 * jquery plugin for AutoGrow, taken from VisualSearch
 */
(function() {

var $ = jQuery; // Handle namespaced jQuery

$.fn.extend({

	// When attached to an input element, this will cause the width of the input
	// to match its contents. This calculates the width of the contents of the input
	// by measuring a hidden shadow div that should match the styling of the input.
	autoGrowInput: function() {
		return this.each(function() {
			var $input  = $(this);
			var $tester = $('<div />').css({
				opacity     : 0,
				top         : -9999,
				left        : -9999,
				position    : 'absolute',
				whiteSpace  : 'nowrap',
			}).addClass('POS-input-width-tester');

			// Watch for input value changes on all of these events. `resize`
			// event is called explicitly when the input has been changed without
			// a single keypress.
			var events = 'keydown keyup input propertychange change';
			$input.next('.POS-input-width-tester').remove();
			$input.after($tester);
			$input.unbind(events).bind(events, function(e, realEvent) {
				if (realEvent) e = realEvent;
				var value = $input.val();

				value = value.replace(/&/g, '&amp;')
								.replace(/\s/g,'&nbsp;')
								.replace(/</g, '&lt;')
								.replace(/>/g, '&gt;');

				$tester.html(value);
				var width = $tester.width();
				$input.width(width + 20);
			});

			// Sets the width of the input on initialization.
			$input.trigger('keydown');
		});
	},

});


})();