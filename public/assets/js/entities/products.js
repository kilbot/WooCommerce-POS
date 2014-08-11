define([
	'app', 
	'entities/products/product', 
	'entities/products/products', 
	'entities/products/filter', 
	'entities/products/fallback/product', 
	'entities/products/fallback/products', 
	'entities/products/fallback/product_variations',
	'entities/user'
], function(
	POS
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		var API = {

			getProductEntities: function() {
				if(Modernizr.indexeddb) {

					var products = new Entities.Products();

					var defer = $.Deferred();
					products.fetch({
						success: function(data) {
							defer.resolve(data);
						}
					});

					return defer.promise();

				}

				// fallback for no IndexedDB
				else {
					return this.getFallbackProductEntities();
				}
			},

			getFallbackProductEntities: function() {
				var products = new Entities.FallbackProductCollection();

				var defer = $.Deferred();
				products.fetch({
					success: function(data) {
						defer.resolve(data);
					}
				});

				return defer.promise();
			},

			getFallbackProductEntity: function(productId){
				var product = new Entities.FallbackProduct({ id: productId });

				var defer = $.Deferred();
				products.fetch({
					success: function(data) {
						defer.resolve(data);
					},
					error: function(data) {
						defer.resolve(undefined);
					}
				});

				return defer.promise();
			},

			getFilterCollection: function(products) {
				return new Entities.FilterCollection(products.fullCollection.models, { pageableCollection: products });
			}

		};

		/**
		 * Handlers
		 */
		Entities.channel.reply('product:entities', function() {
			return API.getProductEntities();
		});

		Entities.channel.reply('product:filtercollection', function(products) {
			return API.getFilterCollection(products);
		});

	});

	return;
});