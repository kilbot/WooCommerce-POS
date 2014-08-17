define(['app', 'apps/customer/list/view'], function(POS, View){

	POS.module('CustomerApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options){

			},

			getCartComponent: function(options) {
				var view = new View.CartComponent(options);
				return view;
			}

		});

	});

});