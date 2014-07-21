define(['app'], function(POS){
	
	POS.module('CartApp', function(CartApp, POS, Backbone, Marionette, $, _){

		CartApp.startWithParent = false;

		CartApp.onStart = function(){
      		console.log('starting Cart Module');
    	};

    	CartApp.onStop = function(){
			console.log('stopping Cart Module');
		};

	});

	POS.module('Routers.CartApp', function(CartAppRouter, POS, Backbone, Marionette, $, _){

		CartAppRouter.Router = Marionette.AppRouter.extend({
			appRoutes: {
				'cart/:id' : 'listCartItems'
			}
		});

		var executeAction = function(action, arg){
			POS.startSubApp('CartApp');
			action(arg);
			// POS.execute( 'set:active:header', 'cart' );
		};

		var API = {
			listCartItems: function(options) {
				options || ( options = { cartId: 1 } );
				require(['apps/cart/list/list_controller'], function(ListController){
					executeAction(ListController.listCartItems, options);
				});
			},
			cartTotals: function(options) {
				require(['apps/cart/totals/totals_controller'], function(TotalsController){
					executeAction(TotalsController.showTotals, options);
				});
			}
		};

		this.listenTo( POS, 'cart:list', function(){
			API.listCartItems();
		});

		this.listenTo( POS, 'cart:totals', function(options){
			API.showTotals(options);
		});

		POS.addInitializer( function(){
			new CartAppRouter.Router({
				controller: API
			});
		});

	});

	return POS.CartAppRouter;
});