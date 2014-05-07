/**
 * Order UI
 */

(function ( $ ) {
	"use strict";

	// Checkout click
	$( 'button.btn-checkout' ).click( function(e) {
		e.preventDefault();

			var data = {
				action 		: 'pos_process_order',
 			};

			// Ajax action
			$.post( pos_cart_params.ajax_url, data, function( response ) {

				if ( ! response ) {
					console.log('No response from server');
					return;
				}

				if ( response.error ) {
					console.log(response.error);
					return;
				}

				// set the cart collection
				$('#cart').html( response );

			});

	});

}(jQuery));