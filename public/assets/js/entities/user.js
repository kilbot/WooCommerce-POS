define([
	'app',
	'entities/user/product_settings'
], function(
	POS
){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Entities.channel.reply('user:product:settings', function() {
			return new Entities.ProductSettings();
		});

	});

});