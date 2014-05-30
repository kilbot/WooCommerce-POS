define(['backbone', 'backbone-paginator', 'models/Product'], 
	function(Backbone, PageableCollection, Product){

	// the pageable product list
	var Products = Backbone.PageableCollection.extend({
		url: '/wc-api/v1/products',
		model: Product,

		mode: "server",

		// Initial pagination states
		state: {
			pageSize: 5,
		},

		initialize: function() {
			// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug
		},

		// You can remap the query parameters from `state` keys from
		// the default to those your server supports
		queryParams: {
			filter: {limit: 5},
			totalPages: null,
		},

		// get the state from the server
		parseState: function (resp, queryParams, state, options) {
			// totals are always in the WC API headers
			var totalRecords = parseInt(options.xhr.getResponseHeader('X-WC-Total'));
			var totalPages =parseInt(options.xhr.getResponseHeader('X-WC-TotalPages'));
			return {totalRecords: totalRecords, totalPages: totalPages};
		},

		// get the actual records
		parseRecords: function (resp, options) {
			return resp.products;
		},

	});

  	return Products;

});
