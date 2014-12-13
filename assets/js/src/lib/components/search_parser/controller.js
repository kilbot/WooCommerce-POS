/**
* Used to extract keywords and facets from the search query.
* based on https://github.com/documentcloud/visualsearch/
*/

POS.module('Components.SearchParser', function(SearchParser, POS, Backbone, Marionette, $, _){

    var QUOTES_RE   = "('[^']+'|\"[^\"]+\")";
    var FREETEXT_RE = "('[^']+'|\"[^\"]+\"|[^'\"\\s]\\S*)";
    var CATEGORY_RE = FREETEXT_RE +                     ':\\s*';
    var FREETEXT_CAT = '';

    var Parser = {
        ALL_FIELDS : new RegExp(CATEGORY_RE + FREETEXT_RE, 'g'),
        CATEGORY   : new RegExp(CATEGORY_RE),

        parse : function(query) {
            var searchFacets = this._extractAllFacets(query);
            return searchFacets;
        },

        // Walks the query and extracts facets, categories, and free text.
        _extractAllFacets : function(query) {
            var facets = {};
            var originalQuery = query;
            while (query) {
                var key, value;
                originalQuery = query;
                var field = this._extractNextField(query);
                if (!field) {
                    key     = FREETEXT_CAT;
                    value   = this._extractSearchText(query);
                    query   = query.replace(value, '').trim();
                } else if (field.indexOf(':') != -1) {
                    key     = field.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g, '');
                    value   = field.replace(this.CATEGORY, '').replace(/(^['"]|['"]$)/g, '');
                    query   = query.replace(field, '').trim();
                } else if (field.indexOf(':') == -1) {
                    key     = FREETEXT_CAT;
                    value   = field;
                    query   = query.replace(value, '').trim();
                }

                if ( value ) {
                    _( value.split('|') ).each(function( value ){
                        var val = value.trim().toLowerCase();
                        if( val ) {
                            facets[key] ? facets[key].push(val) : facets[key] = [val];
                        }
                    });
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
            var text = query.replace(this.ALL_FIELDS, '').trim();
            return text;
        },

        // Escape strings that are going to be used in a regex. Escapes punctuation
        // that would be incorrect in a regex.
        escapeRegExp : function(s) {
            return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
        }
    }

    /**
     * API
     */
    SearchParser.channel = Backbone.Radio.channel('search_parser');

    SearchParser.channel.reply('facets', function(query) {
        return Parser.parse(query);
    });

});