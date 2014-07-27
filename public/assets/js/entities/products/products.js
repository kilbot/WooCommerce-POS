define([
	'app', 
	'paginator', 
	'entities/products/db', 
	'entities/products/product',
	'entities/filter',
	'entities/products/tabs',
], function(
	POS, 
	PageableCollection
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.ProductCollection = Backbone.PageableCollection.extend({
			database: Entities.DB,
			storeName: 'products',
			// model: Entities.Product,
			mode: 'client',

			filterEntities: POS.request('filter:entities'),
			tabEntities: POS.request('tab:entities'),

			state: {
				pageSize: 5,
			},
			
			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug

				this.listenTo( this.filterEntities, 'reset', function(e) {
					this._filterProducts();
				}, this);

				this.listenTo( this.tabEntities, 'change:active', function(model) {
					var filter = POS.request('filter:facets', model.get('filter'));
					this.filterEntities.reset(filter);
				}, this);

			},

			/**
			 * Reset collection with filtered results
			 */
			_filterProducts: function() {

				// reset to original list
				filtered = this.filterCollection.models;

				// if active filter
				if( this.filterEntities.length > 0 ) {

					// get facets object
					var criterion = this.filterEntities.facets();

					// filter collection
					filtered = this.filterCollection.filter( function(product){
						return this._matchMaker(product, criterion);
					}, this);
				}

				// reset with filtered list
				this.fullCollection.reset(filtered, {reindex: false});
			},

			/**
			 * Matchmaker
			 * Returns true if product passes criterion
			 */
			_matchMaker: function(product, criterion) {

				return _.every( criterion, function( arr, attr ) {

					if( attr === 'text' ) {
						return _.some( arr, function( value ) {
							return product.get( 'title' ).toLowerCase().indexOf( value ) !== -1;
						});
					}

					// special shorthand for category
					else if( attr === 'cat' ) {
						return _.some( arr, function( value ) {
							var categories = _( product.get('categories') ).map( function( category ) {
								return category.toLowerCase();
							});
							return _( categories ).contains( value );							
						});
					}

					// match array values
					else if( _( product.get( attr ) ).isArray() ) {
						return _.some( arr, function( value ) {
							var array = _( product.get( attr ) ).map( function( value ) {
								return value.toLowerCase();
							});
							return _( array ).contains( value );							
						});
					}

					// else match any attribute
					else {
						return _.some( arr, function( value ) {
							return product.get( attr ).toString() === value;
						});
					}

					return false;

				}, this);

			},

		});

	});

	return;
});