/**
 * Use backbone.js and backgrid.js to display the products
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

		url: pos_cart_params.ajax_url,
		mode: "client",

		// Initial pagination states
		state: {
			pageSize: 5,
			sortKey: "updated",
			// order: 1
		},

		// You can remap the query parameters from `state` keys from
		// the default to those your server supports
		queryParams: {
			action: "get_products",
			totalPages: null,
			totalRecords: null,
			sortKey: "sort",
			q: ""
		},

		// get the state from Github's search API result
		parseState: function (resp, queryParams, state, options) {
			return {totalRecords: resp.total_count};
		},

		// get the actual records
		parseRecords: function (resp, options) {
			return resp.products;
		}

	});

	var products = new Products();

	var grid = new Backgrid.Grid({
		columns: [{
			name: "img",
			label: "",
			cell: Backgrid.Cell.extend({
				render: function() {
					this.$el.html( this.model.get("img") );
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
					var title = '<strong>' + this.model.get("title") + '</strong>';
					if( this.model.has("variation_id") ) {
						var variations = [];
						$.each(this.model.get("variation_data"), function(i,j) {                    
							var str = j.key + ": " + j.value;
							variations.push(str);
						});
						var variation = '<br /><small>' + variations.join("<br>") + '</small>';
					} else {
						var variation = '';
					}
					var stock = (this.model.get("stock") === '') ? '' : '<br /><small>' + this.model.get("stock") + ' in stock</small>';

					this.$el.html( title + variation + stock);
					return this;
				}
			}),
			sortable: false,
           	editable: false
		}, {
			name: "price",
			label: "Price",
			cell: Backgrid.Cell.extend({
				render: function() {
					this.$el.html( this.model.get("price") );
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
					if( this.model.has("variation_id") ) {
						var id 				= this.model.get("parent_id");
						var variation_id 	= this.model.get("variation_id");
						var url 			= '?' + $.param({"add-to-cart":id, "variation_id":variation_id});
					} else {
						var id 				= this.model.get("id");
						var variation_id 	= '';
						var url 			= '?' + $.param({"add-to-cart":this.model.get("id")});
					}
					var btn = '<a class="add-to-cart btn btn-circle btn-flat-action" href="' + url + '" data-id="' + id + '" data-variant_id="' + variation_id + '"><i class="fa fa-plus"></i></a>';
					this.$el.html( btn );
					return this;
				},
				addToCart: function(e) {
					e.preventDefault();
					
					if( this.model.has("variation_id") ) {
						var data = {
							action		: "pos_add_to_cart",
							id			: this.model.get("parent_id"),
							variation_id: this.model.get("variation_id")
						};
					} else {
						var data = {
							action	: "pos_add_to_cart",
							id		: this.model.get("id")
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

						// render the cart
						// o.render();

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
		controls: {
			rewind: null,
			fastForward: null,
			back: {label: "<i class=\"fa fa-chevron-left\"></i>", title: "Previous"}, 
			forward: {label: "<i class=\"fa fa-chevron-right\"></i>", title: "Next"},
		}		, render: function() {
			this.$el.addClass('hi');
			return this;
		}
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

	products.fetch({reset: true});

}(jQuery));
