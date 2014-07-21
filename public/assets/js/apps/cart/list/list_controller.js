define(['app', 'apps/cart/list/list_view'], function(POS, View){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		var Controller = Marionette.Controller.extend({

			initialize: function() {
				// layout
				this.layout = new View.Layout();
			},
			
			listCartItems: function(options){
				require(['common/views', 'common/helpers', 'entities/cart'], function(){

					// loading view
					var loadingView = new POS.Common.Views.Loading();
					POS.rightRegion.show(loadingView);

					// get cart items
					var items = POS.request('cart:items');
					
					List.Controller.listenTo( List.Controller.layout, 'show', function() {
						List.Controller.itemsRegion(items);						
					});
					POS.rightRegion.show(List.Controller.layout);


					// /**
					//  * Listen for delete events
					//  */
					// cartItemsList.on('childview:cartitem:delete', function(childview, model) {
					// 	model.destroy();
					// });

					// /**
					//  * Listen for Void
					//  */
					// cartActions.on('childview:cart:void', function(childview, model) {
						
					// });

					// /**
					//  * Listen for add events
					//  */


					
				});
			},

			itemsRegion: function(items) {

				// get cart view
				var view = new View.CartItems({
					collection: items
				});

				// add cart item
				POS.commands.setHandler('cart:add', function(model) {
					// if product already exists in cart, increase qty
					if( _( items.pluck('id') ).contains( model.attributes.id ) ) {
						items.get( model.attributes.id ).quantity('increase');
					}
					// else, add the product
					else { 
						items.create(model.attributes);
					}
				});

				// remove cart item
				List.Controller.listenTo( view, 'childview:cartitem:delete', function(childview, model) {
					model.destroy();
				});

				// show
				List.Controller.layout.cartRegion.show( view );
			},

		});

		List.Controller = new Controller();

		List.Controller.listenTo(POS.CartApp, 'stop', function(){
			List.Controller.destroy();
		});

	});

	return POS.CartApp.List.Controller;
});