define(['app', 'apps/config/storage/localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * Cart Items
		 */
		Entities.CartItem = Backbone.Model.extend({
			urlRoot: 'cart'
		});
		Entities.configureStorage(Entities.CartItem);

		Entities.CartItemCollection = Backbone.Collection.extend({
			url: 'cart',
			model: Entities.CartItem
		});
		Entities.configureStorage(Entities.CartItemCollection);

		/**
		 * Cart Totals
		 */
		Entities.Totals = Backbone.Model.extend({
			urlRoot: 'cart_totals'
		});
		Entities.configureStorage(Entities.Totals);

		var API = {
			getCartItemEntities: function() {
				var items = new Entities.CartItemCollection();
				items.fetch();
				return items;
			},
			getCartTotals: function() {
				var totals = new Entities.Totals({ id: 1 });
				return totals;
			}
		};

		POS.reqres.setHandler('cart:entities', function() {
			return API.getCartItemEntities();
		});

		POS.reqres.setHandler('cart:totals', function() {
			return API.getCartTotals();
		});

	});

	return;
});