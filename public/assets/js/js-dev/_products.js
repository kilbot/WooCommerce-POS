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
		mode: "server",

		// Initial pagination states
		state: {
			pageSize: 5,
			// sortKey: "updated",
			// order: 1
		},

		// You can remap the query parameters from `state` keys from
		// the default to those your server supports
		queryParams: {
			filter: {limit: 5},
			firstPage: 1,
			totalPages: null,
			totalRecords: null,
			// sortKey: "sort",
			// q: "state:active"
		},

		// get the state from the server
		parseState: function (resp, queryParams, state, options) {

			// totals are always in the WC API headers
			var total = parseInt(options.xhr.getResponseHeader('X-WC-Total'));
			var pages = parseInt(options.xhr.getResponseHeader('X-WC-TotalPages'));
			return {totalRecords: total, totalPages: pages};
		},

		// get the actual records
		parseRecords: function (resp, options) {
			console.log(resp);
			return resp.products;
		},

	});

	var products = new Products();

	var grid = new Backgrid.Grid({
		columns: [{
			name: "featured_src",
			label: "",
			cell: Backgrid.Cell.extend({
				render: function() {
					var image_src = this.model.get("featured_src");
					var thumb_src = image_src.replace(/(\.[\w\d_-]+)$/i, pos_cart_params.thumb_suffix + '$1');
					var thumb = '<img src="' + thumb_src + '">';
					this.$el.html( thumb );
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

					// product options
					var select = '';
					if( this.model.get("variations").length > 0 ) {
						var variations = [];
						$.each(this.model.get("variations"), function(i,variation) {                    
							var id = variation.id;
							var options = [];
							$.each(variation.attributes, function(i,attribute) {
								var option = attribute.option;
								options.push(option);
							});
							var html = '<option value="' + id + '">' + options.join(", ") + '</option>';
							variations = variations + html;
						});
						select = '<select>' + variations + '</select>';
					}
					

					// // product stock
					// var stock = (this.model.get("managing_stock") === false) ? '' : '<br /><small>' + this.model.get("stock_quantity") + ' in stock</small>';

					this.$el.html( title + select);
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
					var id 				= this.model.get("id");
					var variation_id 	= '';
					var url 			= '?' + $.param({"add-to-cart":this.model.get("id")});

					var btn = '<a class="add-to-cart btn btn-circle btn-flat-action" href="' + url + '" data-id="' + id + '"><i class="fa fa-plus"></i></a>';
					this.$el.html( btn );
					return this;
				},

				addToCart: function(e) {
					e.preventDefault();

					var data = {
						action	: "pos_add_to_cart",
						id		: this.model.get("id")
					};
					
					var select = $(e.currentTarget).closest( 'tr' ).find( 'td select' ).val();
					alert(select);
					if( select != 'undefined' ) {
						data = {
							variation_id: select
						};
					}

					// Ajax action
					$.post( pos_cart_params.ajax_url, data, function( response ) {

						if ( ! response ) {
							console.log('No response from server');
							return;
						}

						if ( response.error ) {
							console.log(response.error);
							return;
						}

						// update the cart
						mediator.publish("updateCart");

					});
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
		windowSize: 10, // max number of handles
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
		placeholder: 'Search products',
	});

	$("#products").append(filter.render().$el);
	$("#products").append(grid.render().$el);
	$("#products").append(paginator.render().$el);

	console.log('fetching products');
	products.fetch({reset: true});

}(jQuery));
