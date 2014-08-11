define([
	'app',
	'entities/products',
	'apps/products/list/controller'
], function(
	POS
){
	
	POS.module('ProductsApp', function(ProductsApp, POS, Backbone, Marionette, $, _){

		ProductsApp.startWithParent = false;

		// products channel
		ProductsApp.channel = Backbone.Radio.channel('products');
		ProductsApp.List.channel = ProductsApp.channel;

		var listController = new ProductsApp.List.Controller();		

		ProductsApp.onStart = function(){
      		if(POS.debug) console.log('starting Products Module');
      		listController.show();
    	};

    	ProductsApp.onStop = function(){
			if(POS.debug) console.log('stopping Products Module');
			listController.destroy();
		};

		ProductsApp.channel.comply( 'show:download:progress', listController.showModal );

	});

});