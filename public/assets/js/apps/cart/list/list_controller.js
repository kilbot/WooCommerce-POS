define(['app', 'apps/cart/list/list_view'], function(POS, View){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = {
			listCartItems: function(){
				require(['common/views', 'common/helpers', 'entities/cart'], function(){

					// loading view
					var loadingView = new POS.Common.Views.Loading();
					POS.rightRegion.show(loadingView);

					// init Layout
					var cartLayout = new View.Layout();

					// get cart items
					var cartItems = POS.request('cart:items');
					var cartItemsList = new View.CartItems({
						collection: cartItems
					});

					// 
					cartLayout.on('show', function() {
						cartLayout.cartRegion.show(cartItemsList);
						
						// if the cart has items, show totals & actions
						if( cartItems.length > 0 ) {
							cartLayout.cartAccountRegion.show( new View.CartAccount() );
							cartLayout.cartActionsRegion.show( new View.CartActions() );
						}
					});

					/**
					 * Listen for delete events
					 */
					cartItemsList.on('childview:cartitem:delete', function(childview, model) {
						model.destroy();
					});

					/**
					 * Listen for add events
					 */
					POS.commands.setHandler('cart:add', function(model) {

						// if product already exists in cart, increase qty
						if( _( cartItems.pluck('id') ).contains( model.attributes.id ) ) {
							cartItems.get( model.attributes.id ).quantity('increase');
						}

						// else, add the product
						else { 
							cartItems.create(model.attributes);
						}
						
					});

					// display cartLayout
					POS.rightRegion.show(cartLayout);
				});
			}
		};
	});

	return POS.CartApp.List.Controller;
});