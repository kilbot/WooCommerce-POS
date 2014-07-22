define(['app', 'apps/cart/customer/customer_view'], function(POS, View){

	POS.module('CartApp.Customer', function(Customer, POS, Backbone, Marionette, $, _){

		Customer.Controller = Marionette.Controller.extend({

			initialize: function(options){

				this.region = options;

				// 
				this.customerRegion();
			},

			customerRegion: function() {

				var view = new View.Customer();
				this.region.show(view);
			},

		});

	});

	return POS.CartApp.Customer.Controller;
});