(function ( $ ) {
	"use strict";

	$(function () {
		
		// Chosen selects
		jQuery("select.chosen_select").chosen({
			width: '350px',
			disable_search_threshold: 5
		});

		jQuery("select.chosen_select_nostd").chosen({
			allow_single_deselect: 'true',
			width: '350px',
			disable_search_threshold: 5
		});

	});

}(jQuery));