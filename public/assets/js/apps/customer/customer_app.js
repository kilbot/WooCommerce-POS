define(['app', 'apps/customer/list/controller'], function(POS){
	
	POS.module('CustomerApp', function(CustomerApp, POS, Backbone, Marionette, $, _){

		/**
		 * Customer Module
		 */
		CustomerApp.startWithParent = false;

		CustomerApp.onStart = function(){
      		if(POS.debug) console.log('starting Customer Module');
    	};

    	CustomerApp.onStop = function(){
			if(POS.debug) console.log('stopping Customer Module');
		};

		/**
		 * API
		 */
		var API = {
			getCartComponent: function(options) {
				var controller = new CustomerApp.List.Controller();
				return controller.getCartComponent(options)
			}
		};

		/**
		 * Radio
		 */
		CustomerApp.channel = Backbone.Radio.channel('customer');

		CustomerApp.channel.reply( 'customer:select', function(options) {
			return API.getCartComponent(options);
		});

	});

});