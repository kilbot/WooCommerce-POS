define(['app'], function(POS){
	
	POS.module('ProductsApp', function(ProductsApp, POS, Backbone, Marionette, $, _){

		ProductsApp.startWithParent = false;

		ProductsApp.onStart = function(){
      		console.log('starting ProductsApp');
    	};

    	ProductsApp.onStop = function(){
			console.log('stopping ProductsApp');
		};

	});

	POS.module('Routers.ProductsApp', function(ProductsAppRouter, POS, Backbone, Marionette, $, _){

		// ProductsAppRouter.Router = Marionette.AppRouter.extend({
		// 	appRoutes: {
		// 		'products' : 'listProducts'
		// 	}
		// });

		var executeAction = function(action, arg){
			POS.startSubApp('ProductsApp');
			// action(arg);
			POS.execute( 'set:active:header', 'products' );
		};

		var API = {
			listProducts: function() {
				require(['apps/products/list/list_controller'], function(ListController){
					executeAction(ListController.listProducts);
				});
			}
		};

		POS.on( 'products:list', function(){
			API.listProducts();
		});

		// POS.addInitializer( function(){
		// 	new ProductsAppRouter.Router({
		// 		controller: API
		// 	});
		// });

	});

	return POS.ProductsAppRouter;
});