define(['app'], function(POS){

	POS.module('OrderApp.Show.View', function(View, POS, Backbone, Marionette, $, _){

		View.MissingOrder = Marionette.ItemView.extend({
			template: '<div>Missing</div>'
		});

		View.Order = Marionette.ItemView.extend({
			template: '<div>Item</div>',
		});
	});

	return POS.OrderApp.Show.View;
});