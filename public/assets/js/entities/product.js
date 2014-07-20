define(['app', 'paginator'], function(POS, PageableCollection){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Product = Backbone.Model.extend({
			urlRoot: pos_params.wc_api_url + 'products',
		});

		Entities.ProductCollection = Backbone.PageableCollection.extend({
			url: pos_params.wc_api_url + 'products',
			model: Entities.Product,

			state: {
				pageSize: 5,
			},

			queryParams: {
				pos: 1,
				filter: {limit: 5},
				totalPages: null,
			},

			parseState: function (resp, queryParams, state, options) {
				// totals are always in the WC API headers
				var totalRecords = parseInt(options.xhr.getResponseHeader('X-WC-Total'));
				var totalPages =parseInt(options.xhr.getResponseHeader('X-WC-TotalPages'));
				return {totalRecords: totalRecords, totalPages: totalPages};
			},

			parseRecords: function (resp, options) {
				if( resp.products ) {
					return resp.products;
				}
				else {
					return resp;
				}			
			},

		});

		Entities.VariationsCollection = Backbone.PageableCollection.extend({
			model: Entities.Product,
			mode: 'client',

			state: {
				pageSize: 5,
			},

			initialize: function( variations, parent ) {

				// set some attributes from the parent
				_(variations).forEach( function(variation) {
					variation['type'] = 'variation';
					variation['title'] = parent.get('title');
					variation['categories'] = parent.get('categories');				
				});
			}
		});

		var API = {
			getProductEntities: function() {
				var products = new Entities.ProductCollection();

				var defer = $.Deferred();
				products.fetch({
					success: function(data) {
						defer.resolve(data);
					}
				});

				return defer.promise();
			},

			getProductEntity: function(productId){
				var product = new Entities.Product({ id: productId });

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
			} 
		};

		POS.reqres.setHandler('product:entities', function() {
			return API.getProductEntities();
		});

	});

	return;
});