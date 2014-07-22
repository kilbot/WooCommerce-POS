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
      		console.log('starting Checkout Module');
    	};

    	CheckoutApp.onStop = function(){
			console.log('stopping Checkout Module');
		};

	});

	POS.module('Routers.CheckoutApp', function(CheckoutAppRouter, POS, Backbone, Marionette, $, _){
	
		CheckoutAppRouter.Router = Marionette.AppRouter.extend({
			appRoutes: {
				'checkout' : 'showCheckout'
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
			showCheckout: function(options){
				options || ( options = { cartId: 1 } );
				var c = _getController(ShowController, options);
				c.show();
			}
		};

		POS.commands.setHandler('checkout:show', function(){
			API.showCheckout();
		});

		POS.addInitializer(function(){
			new CheckoutAppRouter.Router({
				controller: API
			});
		});

	});

	// return POS.CheckoutAppRouter;
});