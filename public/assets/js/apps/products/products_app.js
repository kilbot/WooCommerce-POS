define(['app', 'apps/products/list/controller'], function(POS){
	
	POS.module('ProductsApp', function(ProductsApp, POS, Backbone, Marionette, $, _){

		/**
		 * Product Module
		 */
		ProductsApp.startWithParent = false;

		ProductsApp.onStart = function(){
      		if(POS.debug) console.log('starting Products Module');
      		API.list();
    	};

    	ProductsApp.onStop = function(){
			if(POS.debug) console.log('stopping Products Module');
		};

		/**
		 * API
		 */
		var API = {
			list: function() {
				var controller = new ProductsApp.List.Controller();
				ProductsApp.channel.comply( 'show:download:progress', controller.showModal );
			}
		};

		/**
		 * Radio
		 */
		ProductsApp.channel = Backbone.Radio.channel('products');

	});

});