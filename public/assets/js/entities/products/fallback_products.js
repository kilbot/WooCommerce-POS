define(['app', 'paginator'], function(POS, PageableCollection){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.FallbackProduct = Backbone.Model.extend();

		Entities.FallbackProductCollection = Backbone.PageableCollection.extend({
			url: pos_params.wc_api_url + 'products',
			model: Entities.FallbackProduct,

			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug

				this.settings = options.settings;
				this._initParams();

				// init search parser collection
				this.filterEntities = POS.Components.SearchParser.channel.request('search:entities');

				this.listenTo( this.settings, 'change:query change:tab change:search_mode', this._filterProducts );		
				
			},

			state: {
				pageSize: 5,
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

			_initParams: function(){
				var self = this;
				this.queryParams = { 
					pos: 1, 
					filter: {limit: 5} 
				};
				this.queryParams.filter['offset'] = function() {
					return (self.state.currentPage - 1) * self.state.pageSize;
				}
			},

			_filterProducts: function() {
				var search_mode = this.settings.get('search_mode'),
					query = this.settings.get('query'),
					tab = this.settings.get('tab');

				var combinedFilter = _.compact([tab, query]).join(' '),
					facets = POS.Components.SearchParser.channel.request('search:facets', combinedFilter );
				
				this.filterEntities.reset( facets );
				this._initParams();

				// if active filter
				if( this.filterEntities.length > 0 ) {

					// get criterion array
					var criterion = this.filterEntities.facets();
					
					// handle free text
					if( _(criterion).has('text') ) {
						if(search_mode === 'barcode') {
							this.queryParams.filter['barcode'] = criterion['text'].join('|');
						} else {
							this.queryParams.filter['q'] = criterion['text'].join('|');
						}
						delete criterion.text;
					}

					_( criterion ).each( function(value, key) {
						this.queryParams.filter[key] = value.join('|');
					}, this);					

				}

				this.getPage( 1 );

			}

		});

	});

});