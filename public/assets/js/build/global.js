/**
 * Focus on search box
 */
function searchFocus() {
	$('#filter input[type=search]').focus();
}

/**
 * Add tabindex to products
 */
function tabIndexProducts() {
	$('#products > tbody > tr').each( function( index ) {
		$('.add-to-cart').attr( 'tabindex', index );
	});
}


(function ( $ ) {
	'use strict';

	/**
	 * User actions: logout
	 */
	$('#user-actions-btn, #user-actions').hover(
		function () {
			$('#user-actions').show();
		},
		function () {
			$('#user-actions').hide();
		}
	);

	/**
	 * Search box focus on page load
	 */
	searchFocus();
	tabIndexProducts();

}(jQuery));