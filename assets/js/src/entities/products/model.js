var DualModel = require('lib/config/dual-model');
var _ = require('lodash');

module.exports = DualModel.extend({
  name: 'product',

  // this is an array of fields used by FilterCollection.matchmaker()
  fields: ['title'],

  /**
   * Helper functions for variation prices
   */
  min: function(attr){
    var variations = this.get('variations');
    if(attr === 'sale_price'){
      variations = _.where(variations, {on_sale: true});
    }
    var attrs = _.pluck(variations, attr);
    if(attrs.length > 0){
      return _(attrs).compact().min();
    }
    return this.get(attr);
  },

  max: function(attr){
    var attrs = _.pluck(this.get('variations'), attr);
    if(attrs.length > 0){
      return _(attrs).compact().max();
    }
    return this.get(attr);
  },

  range: function(attr){
    if(attr === 'sale_price'){
      var min = _.min([this.min('sale_price'), this.min('price')]);
      var max = _.max([this.max('sale_price'), this.max('price')]);
      return _.uniq([min, max]);
    }
    return _.uniq([this.min(attr), this.max(attr)]);
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
   */
  matchMaker: function(query, methods){

    return _.all(query, function(q){

      // barcode
      if( q.type === 'prefix' && q.prefix === 'barcode' ){
        if(q.query){ return this.barcodeMatch(q.query); }
      }

      // cat
      if(q.type === 'prefix' && q.prefix === 'cat'){
        q.prefix = 'categories';
        return methods.prefix(q, this);
      }
    }, this);

  },

  barcodeMatch: function(barcode){
    var type = this.get('type'),
        test = this.get('barcode').toLowerCase(),
        value = barcode.toString().toLowerCase();

    if(test === value) {
      this.trigger('found:barcode', this);
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
    var variations = this.get('variations'),
        match;

    _.each(variations, function(variation){
      if(variation.barcode){
        var test = variation.barcode.toLowerCase();
        if(test === value){
          match = variation;
          return;
        }
        if(test.indexOf( value ) !== -1) {
          match = 'partial';
          return;
        }
      }
    });

    if(match){
      if(match !== 'partial'){
        this.trigger('found:barcode', match, this);
      }
      return true;
    }

    return this.partialBarcodeMatch(test, value);
  }

});