define([
	'app', 
	'entities/products/product', 
	'entities/products/products', 
	'entities/products/filter_collection', 
	'entities/products/fallback_products', 
	'entities/user'
], function(
	POS
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Entities.channel.reply('product:entities', function( options ) {
			var products;

			if(Modernizr.indexeddb) {
				products = new Entities.Products( [], options );	
			} else {
				products = new Entities.FallbackProductCollection( [], options );
			}

			return products;
		});

		Entities.channel.reply('product:filtercollection', function( options ) {
			return new Entities.FilterCollection( [], options );
		});

	});

});