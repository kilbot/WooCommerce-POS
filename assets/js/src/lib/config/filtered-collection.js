/**
 * TODO: this file is bit of a mess
 * a cleaner solution may be to remove the dependency
 * on the FilteredCollection library and extend a
 * Backbone Collection
 */

var bb = require('backbone');
var _ = require('underscore');
var POS = require('lib/utilities/global');

/**
 * Search Parser
 * Used to extract keywords and facets from the search query.
 * based on https://github.com/documentcloud/visualsearch/
 */

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
        _( value.split('|') ).each(function( value ){
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
  },

  // Escape strings that are going to be used in a regex.
  // Escapes punctuation that would be incorrect in a regex.
  escapeRegExp : function(s) {
    return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
  }
};

/**
 * Extend the FilteredCollection class
 */
_.extend( bb.FilteredCollection.prototype, {

  query: function( query, label ){
    label = label || 'search';
    var criterion = Parser.parse( query );

    // syphon off special cases
    this.checkCriterion( criterion );
    this.filterBy( label,
      //_.bind( collection.matchMaker, collection, criterion, fields )
      _.partial( this.matchMaker, criterion )
    );
  },

  checkCriterion: function(criterion){

    // special cases for product search
    if( _(this._superset).has('indexedDB') &&
      this._superset.indexedDB.dbName === 'wc_pos_products' ){

      if( _(criterion).has('parent') ){
        this.removeFilter('hideVariations');
        //criterion.type = ['variation'];
      } else {
        this.hideVariations();
      }

      if( _( criterion ).has( 'barcode' ) ){
        this.barcodeSearch( criterion.barcode );
      }
    }
  },

  matchMaker: function( criterion, model ){

    return _.all( criterion, function( array, key ) {

      if( key === '' ) {
        return _.all( array, function( value ) {
          var attributes = _.pick( model.attributes, ( model.fields || 'title' ) );
          return _.any( _.values( attributes ), function( attribute ) {
            return attribute.toLowerCase().indexOf( value ) !== -1;
          });
        });
      }

      // special shorthand for category
      else if( key === 'cat' ) {
        return _.any( array, function( value ) {
          var cats = _( model.get('categories') ).map( function( category ) {
            return category.toLowerCase();
          });
          return _( cats ).contains( value );
        });
      }

      // match any attribute
      else if( _( model.attributes ).has( key ) ) {

        // if attribute is array, return any match
        if( _( model.get( key ) ).isArray() ) {
          return _.any( array, function( value ) {
            var arr = _( model.get( key ) ).map( function( value ) {
              return value;
            });
            return _( arr ).contains( value );
          });
        }

        // else match as string
        else {
          return _.any( array, function( value ) {
            return model.get( key ).toString().toLowerCase() === value;
          });
        }
      }

      return false;

    }, this);

  },

  hideVariations: function(){
    this.filterBy( 'hideVariations', function( model ){
      return model.get('type') !== 'variation';
    });
  }

//barcodeSearch: function( barcode ) {
//var filteredVariations = [];

//filteredProducts = products.filter( function(product){
//    if( product.get('type') === 'variable' ) {
//        _( product.get('variations') ).each( function(variation) {
//            if( variation.barcode.toLowerCase() === query.toLowerCase() ) {
//                variation['type'] = 'variation';
//                variation['title'] = product.get('title');
//                variation['categories'] = product.get('categories');
//                var model = new Entities.Product( variation );
//                filteredVariations.push( model );
//            }
//        })
//    }
//    return product.get( 'barcode' ).toLowerCase() === query.toLowerCase();
//}, this);
//
//products = filteredProducts.concat(filteredVariations);
//if(POS.debug) console.log('found ' + products.length + ' products');
//
//// add product to cart and reset search field
//if( products.length === 1 && products[0].get('type') !== 'variable' ){
//    if(POS.debug) console.log('adding ' +
// products[0].get('title') +
// ' to cart');
//    POS.CartApp.channel.command( 'cart:add', products[0] );
//    POS.ProductsApp.channel.command( 'clear:filter' );
//}

//}

});

/**
 * note: FilteredCollection is not a Backbone.Collection
 * which means it lacks some methods, such as extend
 */
module.exports = POS.FilteredCollection = bb.FilteredCollection;