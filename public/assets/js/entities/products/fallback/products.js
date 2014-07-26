define(['app', 'paginator', 'entities/products/product'], function(POS, PageableCollection){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.FallbackProductCollection = Backbone.PageableCollection.extend({
			url: pos_params.wc_api_url + 'products',
			model: Entities.FallbackProduct,

			initialize: function(options) {
				// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug
				
				options || (options = {});
				this.parameters = options.parameters || new Backbone.Model({ page: 1 });

				var self = this;
				this.listenTo( this.parameters, 'change', function(model) {
					if( _.has( model.changed, 'criterion' )) {
						self.queryParams.filter['q'] = self.parameters.get('criterion');
					}
					self.getPage( parseInt( self.parameters.get('page') , 10 ) );
				});
			},

			state: {
				pageSize: 5,
			},

			queryParams: {
				pos: 1,
				filter: {limit: 5},
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

	});

	return;
});