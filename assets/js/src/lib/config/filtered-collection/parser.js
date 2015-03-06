/**
 * TODO: this file is bit of a mess
 * a cleaner solution may be to combine with
 * FilteredCollection and create one class
 */

/* jshint -W109, -W083, -W071, -W074 */

var _ = require('lodash');

/**
 * Search Parser
 * Used to extract keywords and facets from the search query.
 * based on https://github.com/documentcloud/visualsearch/
 */

var QUOTES_RE   = "('[^']+'|\"[^\"]+\")";
var FREETEXT_RE = "('[^']+'|\"[^\"]+\"|[^'\"\\s]\\S*)";
var CATEGORY_RE = FREETEXT_RE +                     ':\\s*';
var FREETEXT_CAT = '';

module.exports = {
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
        key   = FREETEXT_CAT;
        value = this._extractSearchText(query);
        query = query.replace(value, '').trim();
      } else if (field.indexOf(':') !== -1) {
        key   = field.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g, '');
        value = field.replace(this.CATEGORY, '').replace(/(^['"]|['"]$)/g, '');
        query = query.replace(field, '').trim();
      } else if (field.indexOf(':') === -1) {
        key   = FREETEXT_CAT;
        value = field;
        query = query.replace(value, '').trim();
      }

      if ( value ) {
        _.each(value.split('|'), function( value ){
          var val = value.trim().toLowerCase();
          if( val ) {
            if( facets[key] ) {
              facets[key].push(val);
            } else {
              facets[key] = [val];
            }
          }
        });
      }
      if (originalQuery === query) {
        break;
      }
    }
    return facets;
  },

  // Extracts the first field found, capturing any free text that comes
  // before the category.
  _extractNextField : function(query) {
    var textRe = new RegExp('^\\s*(\\S+)\\s+(?=' +
    QUOTES_RE + FREETEXT_RE +
    ')');
    var textMatch = query.match(textRe);
    if (textMatch && textMatch.length >= 1) {
      return textMatch[1];
    } else {
      return this._extractFirstField(query);
    }
  },

  // If there is no free text before the facet,
  // extract the category and value.
  _extractFirstField : function(query) {
    var fields = query.match(this.ALL_FIELDS);
    return fields && fields.length && fields[0];
  },

  // If the found match is not a category and facet,
  // extract the trimmed free text.
  _extractSearchText : function(query) {
    query = query || '';
    var text = query.replace(this.ALL_FIELDS, '').trim();
    return text;
  }

};