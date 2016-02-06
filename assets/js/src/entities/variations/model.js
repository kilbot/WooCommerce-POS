var Model = require('lib/config/deep-model');

module.exports = Model.extend({

  // data types
  schema: {
    price         : 'number',
    regular_price : 'number',
    sale_price    : 'number',
    stock_quantity: 'number'
  },

  /**
   * Attach parent product, add defaults
   */
  constructor: function(attributes, options){
    options = options || {};
    this.parent = options.parent;

    this.defaults = {
      type  : 'variation',
      title : options.title
    };

    Model.apply( this, arguments );
  }

});