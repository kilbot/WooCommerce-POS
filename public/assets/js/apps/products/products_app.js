define([
	'app',
	'apps/products/list/list_controller'
], function(
	POS,
	ListController
){
	
	POS.module('ProductsApp', function(ProductsApp, POS, Backbone, Marionette, $, _){

		ProductsApp.startWithParent = false;

		var _getController = function(Controller, options){
			var c = new Controller(options);
			c.listenTo(POS.ProductsApp, 'stop', function(){
				c.destroy();
			});
			return c;
		};

		var API = {
			list: function(id){
				id ? options = { cartId: id } : options = {};
				var c = _getController(ListController, options);
				c.show();
			}
		};

		ProductsApp.onStart = function(){
      		console.log('starting Products Module');
      		API.list();
    	};

    	ProductsApp.onStop = function(){
			console.log('stopping Products Module');
		};

	});

});