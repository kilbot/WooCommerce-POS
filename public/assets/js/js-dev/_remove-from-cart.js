/**
 * AJAX remove from cart
 */

(function ( $ ) {
	"use strict";

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params.ajax_url');
		return false;
	}
	
	// bind to .product-remove
	$( document ).on( 'click', '.product-remove a', function(e) {

 		var $thisbutton = $( this );

 		if ( ! $thisbutton.attr( 'href' ) ) {
 			console.log('No href');
			return true;
 		}

		e.preventDefault();
	
		// Block cart fragment
		$( '#cart_fragment' ).fadeTo( '400', '0.6' ).block({ message: null, overlayCSS: { background: 'transparent url(' +  pos_cart_params.loading_icon + ') no-repeat center', backgroundSize: '16px 16px', opacity: 0.6 } } );

 		var data = {
			action: 'pos_remove_item',
			href: $thisbutton.attr( 'href' ),
		};

		// put spinner over cart

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

			var fragments = response.fragments;
			var cart_hash = response.cart_hash;
			
			// Replace fragments
			if ( fragments ) {
				$( "#cart_fragment" ).replaceWith( fragments );
			}

		});
	});

}(jQuery));