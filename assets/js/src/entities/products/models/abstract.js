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
      .filter({variation: false})
      .filter({visible: true})
      .value();
  }

});