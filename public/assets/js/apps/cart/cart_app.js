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
			var c = new Controller(options);
			c.listenTo(POS.CartApp, 'stop', function(){
				c.destroy();
			});
			return c;
		};

		var API = {
			listCartItems: function(id) {
				id ? options = { cartId: id } : options = {};
				var c = _getController(ListController, options);
				c.show();
			},
			showCustomer: function(region) {
				var c = _getController(CustomerController, region);
				c.show();
			}
		};

		this.listenTo( POS, 'cart:list', function(id){
			if(id) {
				POS.navigate('cart/' + id);
			} else {
				POS.navigate('');
			}
			API.listCartItems(id);
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