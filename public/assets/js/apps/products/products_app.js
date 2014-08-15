define(['app', 'apps/products/list/controller'], function(POS){
	
	POS.module('ProductsApp', function(ProductsApp, POS, Backbone, Marionette, $, _){

		ProductsApp.startWithParent = false;

		// products channel
		ProductsApp.channel = Backbone.Radio.channel('products');
		ProductsApp.List.channel = ProductsApp.channel;	

		ProductsApp.onStart = function(){
      		if(POS.debug) console.log('starting Products Module');
      		new ProductsApp.List.Controller();
    	};

    	ProductsApp.onStop = function(){
			if(POS.debug) console.log('stopping Products Module');
		};

		ProductsApp.channel.comply( 'show:download:progress', ProductsApp.List.showModal );

		// addInit, set idb or rest api

	});

});