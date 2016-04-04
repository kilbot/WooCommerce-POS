var Model = require('./abstract');
var Variations = require('../../variations/collection');

module.exports = Model.extend({

  /**
   * attach variations during parse
   */
  parse: function( attributes ){
    attributes = Model.prototype.parse.call( this, attributes );

    if( attributes.variations && ! this.variations ){
      this.attachVariations( attributes );
    }

    return attributes;
  },

  /**
   * attach Filtered Collection of variations
   */
  attachVariations: function( attributes ){
    this.variations = new Variations(attributes.variations, {
      parent: this, // a reference to the parent model
      parentAttrs: attributes
    });
  },

  /**
   * return attached variations, returns Filtered Collection
   */
  getVariations: function(){
    return this.variations;
  },

  /**
   * Wrapper for variation options
   */
  getVariationOptions: function(){
    return this.variations.getVariationOptions();
  },

  /**
   * Wrapper for variations range
   */
  getRange: function( attribute ){
    return this.variations.range( attribute );
  }

  /**
   * Special cases for product model filter
   * @param {Array} tokens An array of query tokens, see QParser
   * @param {Object} methods Helper match methods
   * @param {Function} callback
   */
  //matchMaker: function(tokens, methods, callback){
  //
  //  var match = _.all(tokens, function(token){
  //
  //    // barcode
  //    if( token.type === 'prefix' && token.prefix === 'barcode' ){
  //      if(token.query){ return this.barcodeMatch(token.query); }
  //    }
  //
  //    // cat
  //    if( token.type === 'prefix' && token.prefix === 'cat' ){
  //      token.prefix = 'categories';
  //      return methods.prefix(token, this);
  //    }
  //
  //  }, this);
  //
  //  //if(match){
  //  //  return match;
  //  //}
  //
  //  // the original matchMaker
  //  return match ? match : callback(tokens, this);
  //
  //},
  //
  //barcodeMatch: function(barcode){
  //  var type = this.get('type'),
  //    test = this.get('barcode').toLowerCase(),
  //    value = barcode.toString().toLowerCase();
  //
  //  if(test === value) {
  //    if(type !== 'variable'){
  //      this.trigger('match:barcode', this);
  //    }
  //    return true;
  //  }
  //
  //  if(type !== 'variable'){
  //    return this.partialBarcodeMatch(test, value);
  //  }
  //
  //  return this.variableBarcodeMatch(test, value);
  //},
  //
  //partialBarcodeMatch: function(test, value){
  //  if(test.indexOf( value ) !== -1) {
  //    return true;
  //  }
  //  return false;
  //},
  //
  //variableBarcodeMatch: function(test, value){
  //  var match;
  //
  //  this.getVariations().superset().each(function(variation){
  //    var vtest = variation.get('barcode').toLowerCase();
  //    if(vtest === value){
  //      match = variation;
  //      return;
  //    }
  //    if(vtest.indexOf( value ) !== -1) {
  //      match = 'partial';
  //      return;
  //    }
  //  });
  //
  //  if(match){
  //    if(match !== 'partial'){
  //      this.trigger('match:barcode', match, this);
  //    }
  //    return true;
  //  }
  //
  //  return this.partialBarcodeMatch(test, value);
  //},

  /**
   * Construct variable options from variation array
   * - variable.attributes includes all options, including those not used
   */
  //getVariationOptions: function(){
  //  if( this._variationOptions ) {
  //    return this._variationOptions;
  //  }
  //
  //  var variations = this.get('variations');
  //
  //  // pluck all options, eg:
  //  // { Color: ['Black', 'Blue'], Size: ['Small', 'Large'] }
  //  var result = _.pluck(variations, 'attributes')
  //    .reduce(function(result, attrs){
  //      _.each(attrs, function(attr){
  //        if(result[attr.name]){
  //          return result[attr.name].push(attr.option);
  //        }
  //        result[attr.name] = [attr.option];
  //      });
  //      return result;
  //    }, {});
  //
  //  // map options with consistent keys
  //  this._variationOptions = _.map(result, function(options, name){
  //    return {
  //      'name': name,
  //      'options': _.uniq( options )
  //    };
  //  });
  //
  //  return this._variationOptions;
  //},

});