var bb = require('backbone');
var _ = require('lodash');

var subclasses = {
  product   : require('./models/product'),
  shipping  : require('./models/shipping'),
  fee       : require('./models/fee')
};

module.exports = bb.Collection.extend({

  /**
   * Order cart: products, then shipping, then fees
   */
  comparator: function( model ){
    if( model.type === 'fee' ) { return 2; }
    if( model.type === 'shipping' ) { return 1; }
    return 0;
  },

  model: function(attributes, options){
    var type = _.get( options, ['type'], 'product' );
    return new subclasses[type](attributes, options);
  },

  initialize: function(models, options){
    options = options || {};
    this.order = options.order;
  },

  /**
   * Cart items should always be init with attributes, not bb.Model
   * - convert product models to attributes
   * - parse attributes, eg: productModel.id = cartModel.product_id
   * - if count = 1 for product id, bump quantity
   */
  add: function( models, options ){
    var self = this,
      parsedAttrs = [],
      type = _.get( options, ['type'], 'product' );

    models = !_.isArray(models) ? [models] : models;

    _.each(models, function(model){
      var attrs = model instanceof bb.Model ? model.toJSON() : model;
      attrs = subclasses[type].prototype.parse( attrs );
      if( type === 'product' ){
        var products = self.where({ product_id: attrs.product_id });
        if( products.length === 1 ){
          products[0].quantity('increase').trigger('pulse');
          return;
        }
      }
      return parsedAttrs.push(attrs);
    });

    var model = bb.Collection.prototype.add.call(this, parsedAttrs, options);
    if( model instanceof bb.Model ){
      model.trigger('pulse');
    }
    return model;
  },

  /**
   * convenience method to sum attributes in cart
   */
  sum: function(attribute, type){
    return this.reduce( function( sum, model ){
      if( type && type !== model.type ){
        return sum;
      }
      return sum + parseFloat( model.get(attribute) );
    }, 0 );
  }

});