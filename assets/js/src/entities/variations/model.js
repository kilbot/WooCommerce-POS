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
    data.name = parentAttrs.name;

    // merge parent variations and attributes to allow 'Any ...'
    var attributes = this.collection.parent.getVariationOptions();
    data.attributes = _.map(attributes, function(attribute){
      var attr = _.find(data.attributes, { name: attribute.name } );
      return attr ? attr : attribute;
    });

    return data;
  }

});