var Model = require('lib/config/model');
var _ = require('lodash');

module.exports = Model.extend({

  extends: ['filtered'],

  // data types
  schema: {
    price         : 'number',
    regular_price : 'number',
    sale_price    : 'number',
    stock_quantity: 'number'
  },

  defaults: {
    type: 'variation'
  },

  constructor: function(attributes, options){
    options = _.extend({parse: true}, options); // parse by default
    Model.call(this, attributes, options);
  },

  parse: function(data, options){
    options = options || {};
    var parentAttrs = options.parentAttrs || {};
    if( _.isEmpty(parentAttrs) && this.collection && this.collection.parent ){
      parentAttrs = this.collection.parent.toJSON();
    }

    // use parent title
    data.title = parentAttrs.title;

    // special case, empty option
    _(data.attributes).chain()
      .filter({option: ''})
      .each(function(empty){
        empty.option = _(parentAttrs.attributes).chain()
          .find({ name: empty.name, variation: true })
          .get(['options']).value();
      })
      .value();

    return data;
  }

});