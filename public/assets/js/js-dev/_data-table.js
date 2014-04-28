/**
 * Set up the DataTable plugin for products
 */

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

}(jQuery));