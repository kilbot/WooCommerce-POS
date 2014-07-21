define(['app', 'entities/cart/item', 'apps/config/storage/localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItemCollection = Backbone.Collection.extend({
			url: 'cart',
			model: Entities.CartItem,

			initialize: function(models, options) { 
				// this.on('all', function(e) { console.log("Cart Items event: " + e); }); // debug
				
				// listen to cart collection
				this.listenTo( this, 'add change remove reset', this.updateTotals );
			},

		});

		Entities.configureStorage(Entities.CartItemCollection);

	});

	return;
});