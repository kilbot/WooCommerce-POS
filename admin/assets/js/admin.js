(function ( $ ) {
	"use strict";

	$(function () {

		// Sorting
		jQuery('table.wc_gateways tbody').sortable({
			items:'tr',
			cursor:'move',
			axis:'y',
			handle: 'td',
			scrollSensitivity:40,
			helper:function(e,ui){
				ui.children().each(function(){
					jQuery(this).width(jQuery(this).width());
				});
				ui.css('left', '0');
				return ui;
			},
			start:function(event,ui){
				ui.item.css('background-color','#f6f6f6');
			},
			stop:function(event,ui){
				ui.item.removeAttr('style');
			}
		});
		
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