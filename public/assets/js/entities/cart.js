define(['app', 
	'entities/cart/item', 
	'entities/cart/items', 
	'entities/cart/totals'
], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var API = {
			getCartItems: function() {
				var items = new Entities.CartItemCollection();
				items.fetch();
				return items;
			},
			getCartTotals: function(cart) {
				var cartId = 1;
				var totals = new Entities.Totals({ id: cartId, cart: cart });
				totals.fetch();
				return totals;
			}
		};

		POS.reqres.setHandler('cart:items', function() {
			return API.getCartItems();
		});

		POS.reqres.setHandler('cart:totals', function(cart) {
			return API.getCartTotals(cart);
		});

	});

	return;
});