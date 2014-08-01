define([
	'app', 
	'entities/products/product'
], function(
	POS
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.FilterCollection = Backbone.Collection.extend({
			model: Entities.Product,
			
			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Filter Collection event: " + e); }); // debug
				
				// init references
				this.pageableCollection = options.pageableCollection;
				this.filterEntities = POS.request('search:entities');
				this.activeTab = '';
				this.searchQuery = '';

				this.on( 'filter:products', function() {
					this.onFilterProducts();
				});

			},

			/**
			 * Reset collection with filtered results
			 */
			onFilterProducts: function() {
				var original = this.models,
					facets = POS.request('search:facets', this.activeTab + ' ' + this.searchQuery );
				
				this.filterEntities.reset( facets );

				// if active filter
				if( this.filterEntities.length > 0 ) {

					if(POS.debug) console.log('[notice] Product filter = ' + this.activeTab + ' ' + this.searchQuery);

					// get criterion array
					var criterion = this.filterEntities.facets();

					// special case for barcode
					if( _(criterion).has('barcode') ) {
						this._barcodeSearch( criterion['barcode'] );
						return;
					}
					
					// if has parent reset list as variations
					if( _(criterion).has('parent') ) {
						original = this._variations( criterion['parent'] );
						delete criterion.parent;
					}

					// filter collection
					filteredList = original.filter( function(product){
						return this._matchMaker(product, criterion);
					}, this);

					// update pageable collection
					this.pageableCollection.fullCollection.reset(filteredList, { reindex: false });

				}

				// else reset with original
				else {
					this.pageableCollection.fullCollection.reset(original, { reindex: false });
				}

				

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
					var parent = this.get(id);
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

			_barcodeSearch: function(barcode) {

			},


		});

	});

	return;
});