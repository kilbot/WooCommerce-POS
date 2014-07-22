define([
	'app',
	'apps/cart/list/list_controller',
	'apps/cart/customer/customer_controller'
], function(
	POS, 
	ListController,
	CustomerController
){
	
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

		var _getController = function(Controller, options){
			POS.startSubApp('CartApp');
			var controller = new Controller(options);
			controller.listenTo(POS.CartApp, 'stop', function(){
				controller.destroy();
			});
			return controller;
		};

		var API = {
			listCartItems: function(options) {
				options || ( options = { cartId: 1 } );
				var controller = _getController(ListController, options);
				controller.show();
			},
			showCustomer: function(region) {
				var controller = _getController(CustomerController, region);
				controller.show();
			}
		};

		this.listenTo( POS, 'cart:list', function(){
			API.listCartItems();
		});

		POS.commands.setHandler( 'cart:customer', function(region) {
			API.showCustomer(region)
		});

		POS.addInitializer( function(){
			new CartAppRouter.Router({
				controller: API
			});
		});

	});

});