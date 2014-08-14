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
				this.filterEntities = POS.Components.SearchParser.channel.request('search:entities');

				this.on( 'filter:products', function( mode ) {
					if( mode === 'barcode' ) {
						this._barcodeSearch();
					} else {
						this._filterProducts();
					}
				});

			},

			/**
			 * Reset collection with filtered results
			 */
			_filterProducts: function() {
				var filteredList = this.models,
					combinedFilter = _.compact([this.activeTab, this.searchQuery]).join(' '),
					facets = POS.Components.SearchParser.channel.request('search:facets', combinedFilter );
				
				this.filterEntities.reset( facets );

				if(POS.debug) console.log('Product filter = "' + combinedFilter + '"');

				// if active filter
				if( this.filterEntities.length > 0 ) {

					// get criterion array
					var criterion = this.filterEntities.facets();
					
					// if has parent switch list to variations
					if( _(criterion).has('parent') ) {
						filteredList = this._variations( criterion['parent'] );
						delete criterion.parent;
					}

					// filter collection
					filteredList = filteredList.filter( function(product){
						return this._matchMaker(product, criterion);
					}, this);

				}

				this.pageableCollection.getFirstPage({ silent: true });
				this.pageableCollection.fullCollection.reset(filteredList, { reindex: false });

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
								return product.get( attr ).toString().toLowerCase() === value.toLowerCase();
							});
						}
					}

					return false;

				}, this);

			},

			_barcodeSearch: function() {
				var filteredList = this.models,
					query = this.searchQuery.toLowerCase(),
					filteredVariations = [];

				if( query ) {

					if(POS.debug) console.log('searching for barcode: ' + query);
					filteredProducts = filteredList.filter( function(product){
						if( product.get('type') === 'variable' ) {
							_( product.get('variations') ).each( function(variation) {
								if( variation.barcode.toLowerCase() === query ) {
									variation['type'] = 'variation';
									variation['title'] = product.get('title');
									variation['categories'] = product.get('categories');
									var model = new Entities.Product( variation );
									filteredVariations.push( model );
								}
							})
						}
						return product.get( 'barcode' ).toLowerCase() === query;
					}, this);

					filteredList = filteredProducts.concat(filteredVariations);
					if(POS.debug) console.log('found ' + filteredList.length + ' products');

					this.pageableCollection.getFirstPage({ silent: true });
					this.pageableCollection.fullCollection.reset(filteredList, { reindex: false });

					if( filteredList.length === 1 && filteredList[0].get('type') !== 'variable' ){
						if(POS.debug) console.log('adding ' + filteredList[0].get('title') + ' to cart');
						POS.CartApp.channel.command( 'cart:add', filteredList[0] );
						POS.ProductsApp.channel.command( 'clear:filter' );
					}

				}

				// honor tab filters
				else {
					this._filterProducts();	
				}

			},

		});

	});

	return;
});