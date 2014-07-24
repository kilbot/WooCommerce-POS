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
				'cart/:id' : 'list'
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
			list: function(id) {
				id ? options = { cartId: id } : options = {};
				var c = _getController(ListController, options);
				c.show();
			},
			showCustomerRegion: function(region) {
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
			API.list(id);
		});

		this.listenTo( POS, 'cart:add', function(model){
			// console.log(POS.CartApp);

			// if(CartApp) {
			// 	console.log();
			// }
			// else {
			// 	console.log('Cart Module is not open');
			// }
		});

		POS.commands.setHandler( 'cart:customer', function(region) {
			API.showCustomerRegion(region)
		});

		POS.addInitializer( function(){
			new CartAppRouter.Router({
				controller: API
			});
		});

	});

});