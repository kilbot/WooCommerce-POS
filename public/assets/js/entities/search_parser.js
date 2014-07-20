/**
 * Used to extract keywords and facets from the free text search.
 * based on https://github.com/documentcloud/visualsearch/
 */

define(['app'], function(POS) {

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var QUOTES_RE   = "('[^']+'|\"[^\"]+\")";
		var FREETEXT_RE = "('[^']+'|\"[^\"]+\"|[^'\"\\s]\\S*)";
		var CATEGORY_RE = FREETEXT_RE +                     ':\\s*';
		var FREETEXT_CAT = 'text';
	
		Entities.SearchParser = {

  			ALL_FIELDS : new RegExp(CATEGORY_RE + FREETEXT_RE, 'g'),
			CATEGORY   : new RegExp(CATEGORY_RE),

			parse : function(query) {
				var searchFacets = this._extractAllFacets(query);
				return searchFacets;
			},

			// Walks the query and extracts facets, categories, and free text.
  			_extractAllFacets : function(query) {
				var facets = [];
				var originalQuery = query;
				while (query) {
					var category, value;
					originalQuery = query;
					var field = this._extractNextField(query);
					if (!field) {
						category = this.FREETEXT_CAT;
						value    = this._extractSearchText(query);
						query    = this.trim(query.replace(value, ''));
					} else if (field.indexOf(':') != -1) {
						category = field.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g, '');
						value    = field.replace(this.CATEGORY, '').replace(/(^['"]|['"]$)/g, '');
						query    = this.trim(query.replace(field, ''));
					} else if (field.indexOf(':') == -1) {
						category = this.FREETEXT_CAT;
						value    = field;
						query    = this.trim(query.replace(value, ''));
					}

					if (category && value) {
						var searchFacet = new Entities.SearchFacet({
							category : category,
							value    : this.trim(value),
						});
						facets.push(searchFacet);
					}
					if (originalQuery == query) break;
				}

				return facets;
  			},

			// Extracts the first field found, capturing any free text that comes
			// before the category.
			_extractNextField : function(query) {
				var textRe = new RegExp('^\\s*(\\S+)\\s+(?=' + QUOTES_RE + FREETEXT_RE + ')');
				var textMatch = query.match(textRe);
				if (textMatch && textMatch.length >= 1) {
					return textMatch[1];
				} else {
					return this._extractFirstField(query);
				}
			},

			// If there is no free text before the facet, extract the category and value.
			_extractFirstField : function(query) {
				var fields = query.match(this.ALL_FIELDS);
				return fields && fields.length && fields[0];
			},

			// If the found match is not a category and facet, extract the trimmed free text.
			_extractSearchText : function(query) {
				query = query || '';
				var text = this.trim(query.replace(this.ALL_FIELDS, ''));
				return text;
			},

			// Delegate to the ECMA5 String.prototype.trim function, if available.
			trim : function(s) {
				return s.trim ? s.trim() : s.replace(/^\s+|\s+$/g, '');
			},

			// Escape strings that are going to be used in a regex. Escapes punctuation
			// that would be incorrect in a regex.
			escapeRegExp : function(s) {
				return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
			}

  		};


		/**
		 * Collection which holds all of the individual facets (category: value).
		 * Used for finding and removing specific facets.
		 */
		Entities.SearchQuery = Backbone.Collection.extend({

			// Model holds the category and value of the facet.
			model : Entities.SearchFacet,

			// Turns all of the facets into a single serialized string.
			serialize : function() {
				return this.map(function(facet){ return facet.serialize(); }).join(' ');
			},

			facets : function() {
				return this.map(function(facet) {
					var value = {};
					value[facet.get('category')] = facet.get('value');
					return value;
				});
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
					};
				}).join(' ');
			}

		});


		/**
		 * The model that holds individual search facets and their categories.
		 */
		
		Entities.SearchFacet = Backbone.Model.extend({

			// Extract the category and value and serialize it in preparation for
			// turning the entire searchBox into a search query that can be sent
			// to the server for parsing and searching.
			serialize : function() {
				var category = this.quoteCategory(this.get('category'));
				var value    = Entities.SearchParser.trim(this.get('value'));
				var remainder = this.FREETEXT_CAT;

				if (!value) return '';

				if (!_.contains(this.get("app").options.unquotable || [], category) && category != remainder) {
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

	return POS.Common.Entities;

});