define([
	'app',
	'apps/products/list/list_controller'
], function(
	POS
){
	
	POS.module('ProductsApp', function(ProductsApp, POS, Backbone, Marionette, $, _){

		ProductsApp.startWithParent = false;

		var listController = new ProductsApp.List.Controller();

		ProductsApp.onStart = function(){
      		if(POS.debug) console.log('[notice] starting Products Module');
      		listController.show();
    	};

    	ProductsApp.onStop = function(){
			if(POS.debug) console.log('[notice] stopping Products Module');
			listController.destroy();
		};

		POS.commands.setHandler( 'products:download:modal', function( template, data ) {
			listController.showModal( template, data );
		});

	});

});