/**
 * Use backbone.js and backgrid.js to display the products
 * TODO: get product variations??
 */

(function ( $ ) {
	"use strict";

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params');
		return false;
	}

	// Works exactly like Backbone.Collection.
	var Products = Backbone.PageableCollection.extend({

		url: '/wc-api/v1/products',
		mode: "client", // server may be necessary for large shops, eg: 100+ products

		// Initial pagination states
		state: {
			pageSize: 5,
		},

		// You can remap the query parameters from `state` keys from
		// the default to those your server supports
		queryParams: {
			filter: {limit: -1},
			// totalPages: null,
		},

		// get the state from the server
		parseState: function (resp, queryParams, state, options) {
			// totals are always in the WC API headers
			var total = parseInt(options.xhr.getResponseHeader('X-WC-Total'));
			// var pages = parseInt(options.xhr.getResponseHeader('X-WC-TotalPages'));
			return {totalRecords: total};
		},

		// get the actual records
		parseRecords: function (resp, options) {
			console.log(resp);
			return resp.products;
		},

	});

	/**
	 * Create the collection of Products
	 * QUESTION: Products is a nested JS Object, perhaps nest custom model classes instead?
	 */
	var products = new Products();

	var grid = new Backgrid.Grid({
		columns: [{
			name: "featured_src",
			label: "",
			cell: Backgrid.Cell.extend({
				render: function() {
					this.$el.html( '<img src="' + this.model.get("featured_src") + '">' );
					return this;
				}
			}),
			sortable: false,
           	editable: false
		}, {
			name: "title",
			label: "Product",
			cell: Backgrid.Cell.extend({
				render: function() {

					// product title
					var title = '<strong>' + this.model.get("title") + '</strong>';

					// product variations
					var variation = ( this.model.get("type") === 'variation' ) ? this.model.get("variation_html") : '' ;

					// product stock
					var stock = ( this.model.get("managing_stock") === false ) ? '' : '<small>' + this.model.get("stock_quantity") + ' in stock</small>';

					this.$el.html( title + variation + stock);
					return this;
				}
			}),
			sortable: false,
           	editable: false
		}, {
			name: "price_html",
			label: "Price",
			cell: Backgrid.Cell.extend({
				render: function() {
					this.$el.html( this.model.get("price_html") );
					return this;
				}
			}),
			sortable: false,
           	editable: false
		}, {
			name: "add",
			label: "",
			cell: Backgrid.Cell.extend({
				events: {"click a.add-to-cart": "addToCart"},
				
				render: function() {
					var id 			 = this.model.get("id");
					var variation_id = '';
					var url 		 = '?' + $.param({"add-to-cart":id});

					if( this.model.get("type") === 'variation' ) {
						id 			 = this.model.get("parent_id");
						variation_id = this.model.get("id");
						url 		 = '?' + $.param({"add-to-cart":id,"variation_id":variation_id});
					}

					var btn = '<a class="add-to-cart btn btn-circle btn-flat-action" href="' + url + '" data-id="' + id + '" data-variation_id="' + variation_id + '"><i class="fa fa-plus"></i></a>';
					this.$el.html( btn );
					return this;
				},

				addToCart: function(e) {
					e.preventDefault();

					var id = $(e.currentTarget).attr('data-id');
					var variation_id = $(e.currentTarget).attr('data-variation_id');

					var data = {
						action		 : "pos_add_to_cart",
						id			 : id,
						variation_id : variation_id
					};

					// send to the cart
					mediator.publish("addToCart", this.model);

				}
			}),
			sortable: false,
           	editable: false
		}],

		collection: products
	});

	// Initialize the paginator
	var paginator = new Backgrid.Extension.Paginator({
		collection: products,
		renderIndexedPageHandles: false,
		controls: {
			rewind: null,
			fastForward: null,
			back: {label: "<i class=\"fa fa-chevron-left\"></i>", title: "Previous"}, 
			forward: {label: "<i class=\"fa fa-chevron-right\"></i>", title: "Next"},
		}, 
	});

	// Initialize a client-side filter to filter on the client
	var filter = new Backgrid.Extension.ClientSideFilter({
		collection: products,
		fields: ['title'],
		// name: "filter[q]",
		placeholder: 'Search products',
	});

	$("#filter").append(filter.render().$el);
	$("#products").html(grid.render().$el);
	$("#pagination").html(paginator.render().$el);

	console.log('fetching products');
	products.fetch({reset: true}).complete(function(){
		console.log('products received');
	});

}(jQuery));
