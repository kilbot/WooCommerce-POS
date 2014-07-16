define(['app', 'marionette'], function(POS, Marionette){

	POS.module('CheckoutApp', function(CheckoutApp, POS, Backbone, Marionette, $, _){

		CheckoutApp.startWithParent = false;

		CheckoutApp.onStart = function(){
      		console.log('starting Checkout');
    	};

    	CheckoutApp.onStop = function(){
			console.log('stopping Checkout');
		};

	});

	POS.module('Routers.CheckoutApp', function(CheckoutAppRouter, POS, Backbone, Marionette, $, _){
	
		CheckoutAppRouter.Router = Marionette.AppRouter.extend({
			appRoutes: {
				'checkout' : 'showCheckout'
			}
		});

		var API = {
			showCheckout: function(){
				require(['apps/checkout/show/show_controller'], function(ShowController){
					POS.startSubApp('CheckoutApp');
					ShowController.showCheckout();
				});
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

	return POS.CheckoutAppRouter;
});