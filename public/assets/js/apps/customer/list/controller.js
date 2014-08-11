define(['app', 'apps/customer/list/view'], function(POS, View){

	POS.module('CustomerApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options){

			},

			select: function() {
				var view = new View.CartComponent();
				return view;
			}

		});

	});

});