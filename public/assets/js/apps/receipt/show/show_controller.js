define(['app', 'apps/order/show/show_view'], function(POS, View){
	
	POS.module('OrderApp.Show', function(Show, POS, Backbone, Marionette, $, _){
	
		Show.Controller = {

			showOrder: function(id){
				console.log('show order');
			}
		};

	});

	return POS.OrderApp.Show.Controller;
});