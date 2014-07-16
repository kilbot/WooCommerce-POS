define(['app', 'apps/cart/list/list_view'], function(POS, View){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = {
			listCartItems: function(){
				require(['common/views', 'entities/cart'], function(){

					// loading view
					var loadingView = new POS.Common.Views.Loading();
					POS.rightRegion.show(loadingView);

					// init Layout
					var cartLayout = new View.Layout();

					// get cart items
					var cartItems = POS.request('cart:entities');
					var cartItemsList = new View.CartItems({
						collection: cartItems
					});

					// 
					cartLayout.on('show', function() {
						cartLayout.cartRegion.show(cartItemsList);
						
						// if the cart has items, show totals & actions
						if( cartItems.length > 0 ) {
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
					POS.on('cart:add', function(model) {
						cartItems.create(model.attributes);
					});

					// display cartLayout
					POS.rightRegion.show(cartLayout);
				});
			}
		};
	});

	return POS.CartApp.List.Controller;
});