define([
	'app',
	'entities/customers/customer',
	'entities/customers/customers',
	'entities/user'
], function(
	POS
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Entities.channel.reply('customer:entities', function( options ) {
			return new Entities.Customers();
		});

	});

});