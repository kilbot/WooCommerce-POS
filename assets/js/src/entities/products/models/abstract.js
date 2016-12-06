var Model = require('lib/config/model');
var _ = require('lodash');

module.exports = Model.extend({

  name: 'product',
  extends: ['dual', 'filtered'],

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