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

    this.on('split', this.split, this);
  },

  /**
   * Cart items should always be init with attributes, not bb.Model
   * - convert product models to attributes
   * - always parse attributes, eg: productModel.id = cartModel.product_id
   * - if count = 1 for product id, bump quantity
   */
  add: function( models, options ){
    options = options || {};
    models = !_.isArray(models) ? [models] : models;

    var parsedAttrs = [],
        type = options.type || 'product';

    _.each(models, function(model){
      var attrs = model instanceof bb.Model ? model.toJSON() : model;
      attrs = subclasses[type].prototype.parse.call( this, attrs );

      if( type === 'product' ){
        var products = this.where({ product_id: attrs.product_id });
        if( products.length === 1 && ! options.split ){
          products[0].quantity('increase').trigger('pulse');
          return;
        }
      }

      return parsedAttrs.push(attrs);
    }, this);

    models = bb.Collection.prototype.add.call(this, parsedAttrs, options);
    _.each( models, function( model ){
      model.trigger('pulse');
    } );
    return models;
  },

  /**
   * convenience method to sum attributes in cart
   */
  sum: function(attribute, type){
    return this.reduce( function( total, model ){
      if( type && type !== model.type ){
        return total;
      }
      return _.sum([ total, model.get(attribute) ]);
    }, 0 );
  },

  split: function( model ){
    var models = [],
        qty = model.get( 'quantity'),
        duplicate = Math.ceil( qty - 1 ),
        attributes = _.extend( model.toJSON(), { quantity: 1 } );

    if( duplicate > 0 ){
      for( var i = 0; i < duplicate; i++ ){
        models.push( attributes );
      }
      this.add(models, {
        at: ( model.collection.indexOf( model ) + 1 ),
        split: true,
        silent: true
      });
      model.set({ quantity: qty - duplicate });
      model.collection.trigger('reset'); // re-render the cart
    }

  }

});