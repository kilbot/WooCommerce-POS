define(['app','apps/cart/list/controller'], function(POS){
	
	POS.module('CartApp', function(CartApp, POS, Backbone, Marionette, $, _){

		/**
		 * Cart Module
		 */
		CartApp.startWithParent = false;

		CartApp.onStart = function(){
      		if(POS.debug) console.log('starting Cart Module');
    	};

    	CartApp.onStop = function(){
			if(POS.debug) console.log('stopping Cart Module');
		};

		/**
		 * API
		 */
		var API = {
			list: function(id) {
				new CartApp.List.Controller({
					cartId: id
				});
			}
		};

		/**
		 * Router
		 */
		CartApp.Router = Marionette.AppRouter.extend({
			appRoutes: {
				'cart' : 'list',
				'cart/:id' : 'list'
			}
		});

		POS.addInitializer( function(){
			new CartApp.Router({
				controller: API
			});
		});

		/**
		 * Radio
		 */
		CartApp.channel = Backbone.Radio.channel('cart');

		CartApp.channel.comply( 'cart:list', function(id){
			id ? POS.navigate('cart/' + id) : POS.navigate('') ;
			API.list(id);
		});


	});

});