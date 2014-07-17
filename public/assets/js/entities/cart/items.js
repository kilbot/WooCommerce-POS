define(['app', 'entities/cart/item', 'apps/config/storage/localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItemCollection = Backbone.Collection.extend({
			url: 'cart',
			model: Entities.CartItem

		});

		Entities.configureStorage(Entities.CartItemCollection);

	});

	return;
});