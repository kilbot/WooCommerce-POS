define(['app', 'apps/customer/list/controller'], function(POS){

	POS.module('CustomerApp', function(CustomerApp, POS, Backbone, Marionette, $, _){
		/**
		 * Customer Module
		 */
		CustomerApp.startWithParent = false;

		CustomerApp.onStart = function(){
      		if(POS.debug) console.log('starting Customer Module');
      		API.listCustomers();
    	};

    	CustomerApp.onStop = function(){
			if(POS.debug) console.log('stopping Customer Module');
		};

		CustomerApp.show = function(){
			var controller = new CustomerApp.List.Controller();
			controller.show();
		}


		/**
		 * API
		 */
		var API = {
			show: function() {
				var controller = new CustomerApp.List.Controller();
				controller.show();
			},
			getCartComponent: function(options) {
				var controller = new CustomerApp.List.Controller();
				return controller.getCartComponent(options)
			},
			getUsersComponent: function(options) {
				var controller = new CustomerApp.List.Controller();
				return controller.getUserComponent(options)
			},
			listCustomers: function(){
				var controller = new CustomerApp.List.Controller();
				return controller.listCustomers();
			}

		};

		/**
		 * Radio
		 */
		CustomerApp.channel = Backbone.Radio.channel('customer');

		CustomerApp.channel.reply( 'customer:select', function(options) {
			return API.getCartComponent(options);
		});
		CustomerApp.channel.reply( 'customer:list', function(options) {
			return API.listCustomers(options);
		});

	});

});
