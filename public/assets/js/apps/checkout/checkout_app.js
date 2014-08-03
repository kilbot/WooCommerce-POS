define([
	'app', 
	'apps/checkout/show/show_controller'
], function(
	POS, 
	ShowController
){

	POS.module('CheckoutApp', function(CheckoutApp, POS, Backbone, Marionette, $, _){

		CheckoutApp.startWithParent = false;

		CheckoutApp.onStart = function(){
      		console.log('[notice] starting Checkout Module');
    	};

    	CheckoutApp.onStop = function(){
			console.log('[notice] stopping Checkout Module');
		};

	});

	POS.module('Routers.CheckoutApp', function(CheckoutAppRouter, POS, Backbone, Marionette, $, _){
	
		CheckoutAppRouter.Router = Marionette.AppRouter.extend({
			appRoutes: {
				'checkout' : 'show',
				'checkout/:id' : 'show'
			}
		});

		var _getController = function(Controller, options){
			POS.startSubApp('CheckoutApp');
			var c = new Controller(options);
			c.listenTo(POS.CheckoutApp, 'stop', function(){
				c.destroy();
			});
			return c;
		};

		var API = {
			show: function(id){
				id ? options = { cartId: id } : options = {};
				var c = _getController(ShowController, options);
				c.show();
			}
		};

		this.listenTo( POS, 'checkout:show', function(id){
			if( id && id !== 1 ) {
				POS.navigate('checkout/' + id);
			} else {
				POS.navigate('checkout');
			}
			API.show();
		});

		POS.addInitializer(function(){
			new CheckoutAppRouter.Router({
				controller: API
			});
		});

	});

	// return POS.CheckoutAppRouter;
});