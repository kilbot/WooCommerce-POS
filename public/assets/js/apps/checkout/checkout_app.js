define(['app', 'apps/checkout/payment/controller'], function(POS){

	POS.module('CheckoutApp', function(CheckoutApp, POS, Backbone, Marionette, $, _){

		/**
		 * Checkout Module
		 */
		CheckoutApp.startWithParent = false;

		CheckoutApp.onStart = function(){
      		console.log('[notice] starting Checkout Module');
    	};

    	CheckoutApp.onStop = function(){
			console.log('[notice] stopping Checkout Module');
		};

		/**
		 * API
		 */
		var API = {
			payment: function(id){
				var validId;

				if(0 === id % (!isNaN(parseFloat(id)) && 0 <= ~~id)) {
					validId = id;
				} else {
					validId = 1;
				}

				new CheckoutApp.Payment.Controller({
					cartId: validId
				});
			}
		};
		
		/**
		 * Router
		 */
		CheckoutApp.Router = Marionette.AppRouter.extend({
			appRoutes: {
				'checkout' : 'payment',
				'checkout/:id' : 'payment'
			}
		});

		POS.addInitializer(function(){
			new CheckoutApp.Router({
				controller: API
			});
		});

		/**
		 * Radio
		 */
		CheckoutApp.channel = Backbone.Radio.channel('checkout');

		CheckoutApp.channel.comply( 'checkout:payment', function(id){
			id ? POS.navigate('checkout/' + id) : POS.navigate('checkout') ;
			API.payment(id);
		});

	});

});