define([
	'app',
	'apps/cart/list/controller'
], function(
	POS, 
	ListController
){
	
	POS.module('CartApp', function(CartApp, POS, Backbone, Marionette, $, _){

		CartApp.channel = Backbone.Radio.channel('cart');

		CartApp.startWithParent = false;

		CartApp.onStart = function(){
      		if(POS.debug) console.log('starting Cart Module');
    	};

    	CartApp.onStop = function(){
			if(POS.debug) console.log('stopping Cart Module');
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

		POS.addInitializer( function(){
			new CartAppRouter.Router({
				controller: API
			});
		});

	});

});