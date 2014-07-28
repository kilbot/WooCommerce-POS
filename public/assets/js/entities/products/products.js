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
			model: Entities.Product,
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

			},

			/**
			 * Reset collection with filtered results
			 */
			_filterProducts: function() {

				// reset to original list
				var filtered,
					original = this.productDatabase.models;

				// if active filter
				if( this.filterEntities.length > 0 ) {

					// get facets object
					var criterion = this.filterEntities.facets();
					
					// if has parent reset list as variations
					if( _(criterion).has('parent') ) {
						original = this._variations( criterion['parent'] );
						delete criterion.parent;
					}

					// filter collection
					filtered = original.filter( function(product){
						return this._matchMaker(product, criterion);
					}, this);

				}

				else {
					filtered = original;
				}

				// reset with filtered list
				this.fullCollection.reset(filtered, { reindex: false });

			},

			/**
			 * Contruct product variations
			 * @param  {array} parent ids
			 * @return {array} variations
			 */
			_variations: function(parent_ids) {
				var parents 	= [],
					variations 	= [];

				// get array of parent products
				_( parent_ids ).each( function(id) {
					var parent = this.productDatabase.get(id);
					if(parent) { parents.push(parent); }
				}, this);

				// build array of product variations
				_( parents ).each( function( product ) {
					_( product.get('variations') ).each( function(variation) {
						variation['type'] = 'variation';
						variation['title'] = product.get('title');
						variation['categories'] = product.get('categories');	
						variations.push( new Entities.Product(variation) );
					})
				});

				return variations;
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

					// match any attribute
					else if( _( product.attributes ).has( attr ) ) {

						// attribute is array, return any match
						if( _( product.get( attr ) ).isArray() ) {
							return _.some( arr, function( value ) {
								var array = _( product.get( attr ) ).map( function( value ) {
									return value.toLowerCase();
								});
								return _( array ).contains( value );							
							});
						}

						// else match as string 
						else {
							return _.some( arr, function( value ) {
								return product.get( attr ).toString() === value;
							});
						}
					}

					return false;

				}, this);

			},

		});

	});

	return;
});