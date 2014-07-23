define(['app', 'entities/cart/item', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItemCollection = Backbone.Collection.extend({

			// url: function() {
			// 	return 'cart-' + this.cartId;
			// },
			
			model: Entities.CartItem,

			initialize: function(models, options) { 
				// this.on('all', function(e) { console.log("Cart Items event: " + e); }); // debug				
				
				this.localStorage = new Backbone.LocalStorage( 'cart-' + options.cartId );

			},



		});

		// this gets mixed before initialize is called :(
		// Entities.configureStorage(Entities.CartItemCollection);

	});

	return;
});