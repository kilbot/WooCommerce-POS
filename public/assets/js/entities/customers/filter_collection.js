define([
	'app',
	'entities/customers/customer'
], function(
	POS
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.FilterCollection = Backbone.Collection.extend({
			model: Entities.Customer,

			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Filter Collection event: " + e); }); // debug

				this.settings = options.settings;

				// init search parser collection
				this.filterEntities = POS.Components.SearchParser.channel.request('search:entities');

				this.listenTo( this.settings, 'change:query change:tab change:search_mode', this._filterCustomers );

			},

			/**
			 * Reset collection with filtered results
			 */
			_filterCustomers: function() {
				var filteredList = this.models,
					query = this.settings.get('query'),
					tab = this.settings.get('tab');

				if( this.settings.get('search_mode') === 'barcode' && query ) {

					if(POS.debug) console.log('Barcode search = "' + query + '"');

					this._barcodeSearch(filteredList, query);
					this.filterEntities.reset(); // no attribute search in barcode mode

				} else {

					var combinedFilter = _.compact([tab, query]).join(' '),
						facets = POS.Components.SearchParser.channel.request('search:facets', combinedFilter );
					this.filterEntities.reset( facets );

					if(POS.debug) console.log('Customer filter = "' + combinedFilter + '"');

				}

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
					filteredList = filteredList.filter( function(customer){
						return this._matchMaker(customer, criterion);
					}, this);

				}

				this.trigger('filter:customers', filteredList);

			}

		});

	});

	return;
});