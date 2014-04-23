(function ( $ ) {
	"use strict";

		// set up DataTable
	$('#products').DataTable({
		renderer: "jqueryui", 	// use jqueryui styling
		ordering: false, 		// turn off default sorting
		pageLength: 5, 			// 5 products per page
		lengthMenu: [ 5, 10, 25, 50 ],
		columns: [
    		{ "searchable": false }, 	// column 1: image
    		null, 						// column 2: product name
   			{ "searchable": false }, 	// column 3: price
    		{ "searchable": false }, 	// column 4: add to cart
  		],
	});

	// AJAX add to cart
	$( document ).on( 'click', '.add_to_cart_button', function(e) {

 		var $thisbutton = $( this );

 		if ( ! $thisbutton.attr( 'data-product_id' ) )
			return true;

		e.preventDefault();

 		var data = {
			action: 'pos_add_to_cart',
			href: $thisbutton.attr( 'href' ),
		};

		// put spinner over cart

		// Ajax action
		$.post( ajax_url, data, function( response ) {

			if ( ! response )
				return;

			if ( response.error ) {
				alert(response.msg);
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

	// AJAX add to cart
	$( document ).on( 'click', '.product-remove a', function(e) {

 		var $thisbutton = $( this );

 		if ( ! $thisbutton.attr( 'href' ) )
			return true;

		e.preventDefault();

 		var data = {
			action: 'pos_remove_item',
			href: $thisbutton.attr( 'href' ),
		};

		// put spinner over cart

		// Ajax action
		$.post( ajax_url, data, function( response ) {

			if ( ! response )
				return;

			if ( response.error ) {
				alert(response.msg);
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