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

		Entities.channel.reply('cart:items', function(options) {
			return API.getCartItems(options);
		});

		Entities.channel.reply('cart:totals', function(options) {
			return API.getCartTotals(options);
		});

	});

	return;
});