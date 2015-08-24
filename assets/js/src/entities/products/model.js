var DualModel = require('lib/config/dual-model');
var _ = require('lodash');
var Variations = require('../variations/collection');
var FilteredCollection = require('lib/config/obscura');

module.exports = DualModel.extend({
  name: 'product',

  // this is an array of fields used by FilterCollection.matchmaker()
  fields: ['title'],

  // data types
  schema: {
    price         : 'number',
    regular_price : 'number',
    sale_price    : 'number',
    stock_quantity: 'number'
  },

  initialize: function(){
    this.on({
      'change:updated_at': this.onUpdate
    });
  },

  onUpdate: function(){
    // update stock
    if( this.get('type') === 'variable' ){
      var variations = this.getVariations().superset();
      variations.set( this.get('variations') );
    }
  },

  /**
   * Helper functions to display attributes vs variations
   */
  productAttributes: function(){
    return _.chain(this.get('attributes'))
      .where({variation: false})
      .where({visible: true})
      .value();
  },

  productVariations: function(){
    return _.where(this.get('attributes'), {variation: true});
  },

  /**
   * Special cases for product model filter
   * @param {Array} tokens An array of query tokens, see QParser
   * @param {Object} methods Helper match methods
   * @param {Function} callback
   */
  matchMaker: function(tokens, methods, callback){

    var match = _.all(tokens, function(token){

      // barcode
      if( token.type === 'prefix' && token.prefix === 'barcode' ){
        if(token.query){ return this.barcodeMatch(token.query); }
      }

      // cat
      if( token.type === 'prefix' && token.prefix === 'cat' ){
        token.prefix = 'categories';
        return methods.prefix(token, this);
      }

    }, this);

    if(match){
      return match;
    }

    // the original matchMaker
    return callback(tokens, this);

  },

  barcodeMatch: function(barcode){
    var type = this.get('type'),
        test = this.get('barcode').toLowerCase(),
        value = barcode.toString().toLowerCase();

    if(test === value) {
      if(type !== 'variable'){
        this.trigger('match:barcode', this);
      }
      return true;
    }

    if(type !== 'variable'){
      return this.partialBarcodeMatch(test, value);
    }

    return this.variableBarcodeMatch(test, value);
  },

  partialBarcodeMatch: function(test, value){
    if(test.indexOf( value ) !== -1) {
      return true;
    }
    return false;
  },

  variableBarcodeMatch: function(test, value){
    var match;

    this.getVariations().superset().each(function(variation){
      var vtest = variation.get('barcode').toLowerCase();
      if(vtest === value){
        match = variation;
        return;
      }
      if(vtest.indexOf( value ) !== -1) {
        match = 'partial';
        return;
      }
    });

    if(match){
      if(match !== 'partial'){
        this.trigger('match:barcode', match, this);
      }
      return true;
    }

    return this.partialBarcodeMatch(test, value);
  },

  /**
   * Construct variable options from variation array
   * - variable.attributes includes all options, including those not used
   */
  getVariationOptions: function(){
    if( this._variationOptions ) {
      return this._variationOptions;
    }

    var variations = this.get('variations');

    // pluck all options, eg:
    // { Color: ['Black', 'Blue'], Size: ['Small', 'Large'] }
    var result = _.pluck(variations, 'attributes')
      .reduce(function(result, attrs){
        _.each(attrs, function(attr){
          if(result[attr.name]){
            return result[attr.name].push(attr.option);
          }
          result[attr.name] = [attr.option];
        });
        return result;
      }, {});

    // map options with consistent keys
    this._variationOptions = _.map(result, function(options, name){
      return {
        'name': name,
        'options': _.uniq( options )
      };
    });

    return this._variationOptions;
  },

  /**
   *
   */
  getVariations: function(){
    if( this.get('type') !== 'variable' ){ return false; }
    if( ! this._variations ){
      var variations = new Variations(this.get('variations'), { parent: this });
      this._variations = new FilteredCollection(variations);
    }
    return this._variations;
  }

});