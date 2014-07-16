define(['app'], function(POS){

	POS.module('CheckoutApp.Show.View', function(View, POS, Backbone, Marionette, $, _){

		View.Checkout = Marionette.ItemView.extend({
			template: _.template('<div>Checkout</div>'),
		});
	});

	return POS.CheckoutApp.Show.View;
});