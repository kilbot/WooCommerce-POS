define(['app', 
	'entities/cart/item', 
	'entities/cart/items', 
	'entities/cart/totals'
], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var API = {
			getCartItems: function(options) {
				var items = new Entities.CartItemCollection([], options);
				items.fetch();
				return items;
			},
			getCartTotals: function(options) {
				var totals = new Entities.Totals(options);
				totals.fetch();
				return totals;
			}
		};

		POS.reqres.setHandler('cart:items', function(options) {
			return API.getCartItems(options);
		});

		POS.reqres.setHandler('cart:totals', function(options) {
			return API.getCartTotals(options);
		});

	});

	return;
});