define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CartApp.Customer.View', function(View, POS, Backbone, Marionette, $, _){

		View.Customer = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-customer').html() ),
		});

	});

	return POS.CartApp.Customer.View;
});