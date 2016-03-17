var DualModel = require('lib/config/dual-model');
var _ = require('lodash');

module.exports = DualModel.extend({

  name: 'product',

  // data types
  schema: {
    price         : 'number',
    regular_price : 'number',
    sale_price    : 'number',
    stock_quantity: 'number'
  },

  /**
   * Get the product attributes
   * - not to be confused with Backbone Model attributes
   * - visible product attributes without variations
   */
  getProductAttributes: function(){
    return _.chain(this.get('attributes'))
      .where({variation: false})
      .where({visible: true})
      .value();
  },

  /**
   * Special cases for product model filter
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

    //if(match){
    //  return match;
    //}

    // the original matchMaker
    return match ? match : callback(tokens, this);

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
  }

});