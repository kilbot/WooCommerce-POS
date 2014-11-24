define(['app'], function(POS){

	POS.module('Components.SearchParser', function(SearchParser, POS, Backbone, Marionette, $, _){

		/**
		 * Collection which holds all of the individual facets (category: value).
		 * Used for finding and removing specific facets.
		 */
		SearchParser.Query = Backbone.Collection.extend({

			// Model holds the category and value of the facet.
			model : SearchParser.Facet,

			// Turns all of the facets into a single serialized string.
			serialize : function() {
				return this.map(function(facet){ return facet.serialize(); }).join(' ');
			},

			// facets : function() {
			// 	return this.map(function(facet) {
			// 		var value = {};
			// 		value[facet.get('category')] = facet.get('value');
			// 		return value;
			// 	});
			// },

			// return facets as grouped object
			facets: function() {
				var facets = {};
				this.map(function(facet) {
					if( !_( facets ).has( facet.get('category') ) ) {
						facets[ facet.get('category') ] = [];
					} 
					return facets[ facet.get('category') ].push( facet.get('value') );
				});
				return facets;
			},

			// Find a facet by its category. Multiple facets with the same category
			// is fine, but only the first is returned.
			find : function(category) {
				var facet = this.detect(function(facet) {
				return facet.get('category').toLowerCase() == category.toLowerCase();
			});
				return facet && facet.get('value');
			},

			// Counts the number of times a specific category is in the search query.
			count : function(category) {
				return this.select(function(facet) {
					return facet.get('category').toLowerCase() == category.toLowerCase();
				}).length;
			},

			// Returns an array of extracted values from each facet in a category.
			values : function(category) {
				var facets = this.select(function(facet) {
					return facet.get('category').toLowerCase() == category.toLowerCase();
				});
				return _.map(facets, function(facet) { return facet.get('value'); });
			},

			// Checks all facets for matches of either a category or both category and value.
			has : function(category, value) {
				return this.any(function(facet) {
					var categoryMatched = facet.get('category').toLowerCase() == category.toLowerCase();
				if (!value) return categoryMatched;
					return categoryMatched && facet.get('value') == value;
				});
			},

			// Used to temporarily hide specific categories and serialize the search query.
			withoutCategory : function() {
				var categories = _.map(_.toArray(arguments), function(cat) { return cat.toLowerCase(); });
					return this.map(function(facet) {
					if (!_.include(categories, facet.get('category').toLowerCase())) { 
						return facet.serialize();
					}
				}).join(' ');
			}

		});


		/**
		 * The model that holds individual search facets and their categories.
		 */
		
		SearchParser.Facet = Backbone.Model.extend({

			// Extract the category and value and serialize it in preparation for
			// turning the entire searchBox into a search query that can be sent
			// to the server for parsing and searching.
			serialize : function() {
				var category = this.quoteCategory(this.get('category'));
				var value    = SearchParser.Controller.trim(this.get('value'));
				var remainder = 'text';

				if (!value) return '';

				// if (!_.contains(this.get("app").options.unquotable || [], category) && category != remainder) {
				if (!_.contains([], category) && category != remainder) {
					value = this.quoteValue(value);
				}

				if (category != remainder) {
					category = category + ': ';
				} else {
					category = "";
				}
				return category + value;
			},

			// Wrap categories that have spaces or any kind of quote with opposite matching
			// quotes to preserve the complex category during serialization.
			quoteCategory : function(category) {
				var hasDoubleQuote = (/"/).test(category);
				var hasSingleQuote = (/'/).test(category);
				var hasSpace       = (/\s/).test(category);

				if (hasDoubleQuote && !hasSingleQuote) {
					return "'" + category + "'";
				} else if (hasSpace || (hasSingleQuote && !hasDoubleQuote)) {
					return '"' + category + '"';
				} else {
					return category;
				}
			},

			// Wrap values that have quotes in opposite matching quotes. If a value has
			// both single and double quotes, just use the double quotes.
			quoteValue : function(value) {
				var hasDoubleQuote = (/"/).test(value);
				var hasSingleQuote = (/'/).test(value);

				if (hasDoubleQuote && !hasSingleQuote) {
					return "'" + value + "'";
				} else {
					return '"' + value + '"';
				}
			},

			// If provided, use a custom label instead of the raw value.
			label : function() {
				return this.get('label') || this.get('value');
			}

		});

	});

});