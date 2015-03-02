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
      return _(attrs).compact().min().value();
    }
    return this.get(attr);
  },

  max: function(attr){
    var attrs = _.pluck(this.get('variations'), attr);
    if(attrs.length > 0){
      return _(attrs).compact().max().value();
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
  }

});