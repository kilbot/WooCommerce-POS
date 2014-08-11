define([
	'app',
	'apps/customer/list/controller'
], function(
	POS
){
	
	POS.module('CustomerApp', function(CustomerApp, POS, Backbone, Marionette, $, _){

		// CustomerApp.startWithParent = false;

		// create products channel & pass to sub-modules
		CustomerApp.channel = Backbone.Radio.channel('customer');
		CustomerApp.List.channel = CustomerApp.channel;

		var listController = new CustomerApp.List.Controller();	

		CustomerApp.channel.reply( 'customer:select', function() {
			return listController.select();
		});

	});

});