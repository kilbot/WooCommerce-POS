define(['app', 
	'entities/cart/item', 
	'entities/cart/items', 
	'entities/cart/totals'
], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var API = {
			getCartItems: function(id) {
				return items = new Entities.CartItems([], {
					cartId: id
				});
			},
			getCartTotals: function(id) {
				return totals = new Entities.Totals({
					id: id
				});
			}
		};

		Entities.channel.reply('cart:items', function(id) {
			return API.getCartItems(id);
		});

		Entities.channel.reply('cart:totals', function(id) {
			return API.getCartTotals(id);
		});

	});

	return;
});