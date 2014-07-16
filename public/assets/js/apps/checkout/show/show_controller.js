define(['app', 'apps/checkout/show/show_view'], function(POS, View){
	
	POS.module('CheckoutApp.Show', function(Show, POS, Backbone, Marionette, $, _){
	
		Show.Controller = {

			showCheckout: function(id){
				var view = new View.Checkout();
				POS.rightRegion.show(view);
			}
		};
		
	});

	return POS.CheckoutApp.Show.Controller;
});