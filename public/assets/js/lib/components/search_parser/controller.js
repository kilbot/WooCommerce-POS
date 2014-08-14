/**
 * Used to extract keywords and facets from the search query.
 * based on https://github.com/documentcloud/visualsearch/
 */

define(['app', 'lib/components/search_parser/entities'], function(POS) {

	POS.module('Components.SearchParser', function(SearchParser, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		SearchParser.channel = Backbone.Radio.channel('search_parser');

		SearchParser.channel.reply('search:entities', function() {
			return new SearchParser.Query();
		});

		SearchParser.channel.reply('search:facets', function(query) {
			var searchParser = new SearchParser.Controller();
			return searchParser.parse(query);
		});

		/**
		 * Variables
		 */
		var QUOTES_RE   = "('[^']+'|\"[^\"]+\")";
		var FREETEXT_RE = "('[^']+'|\"[^\"]+\"|[^'\"\\s]\\S*)";
		var CATEGORY_RE = FREETEXT_RE +                     ':\\s*';
		var FREETEXT_CAT = 'text';

		/**
		 * Controller
		 */
		SearchParser.Controller = Marionette.Controller.extend({

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
						category = FREETEXT_CAT;
						value    = this._extractSearchText(query);
						query    = this.trim(query.replace(value, ''));
					} else if (field.indexOf(':') != -1) {
						category = field.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g, '');
						value    = field.replace(this.CATEGORY, '').replace(/(^['"]|['"]$)/g, '');
						query    = this.trim(query.replace(field, ''));
					} else if (field.indexOf(':') == -1) {
						category = FREETEXT_CAT;
						value    = field;
						query    = this.trim(query.replace(value, ''));
					}

					if (category && value) {
						_( value.split('|') ).each(function( value ){
							var val = this.trim( value );
							if( val ) {
								var searchFacet = new SearchParser.Facet({
									category : category,
									value    : val,
								});
								facets.push(searchFacet);
							}
						}, this);
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

		});

	});

});