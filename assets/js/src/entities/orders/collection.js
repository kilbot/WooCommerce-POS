var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var _ = require('lodash');
var $ = require('jquery');
var bb = require('backbone');

module.exports = DualCollection.extend({

  model: Model,

  name: 'orders',

  _syncDelayed: false,

  /**
   *
   */
  setActiveOrder: function(id){
    var order = this.get(id);

    if( !order && id !== 'new' ){
      order = _.first( this.getOpenOrders() );
    }

    this.active = order;
    return order;
  },

  /**
   *
   */
  getOpenOrders: function(){
    return this.filter(function(model){
      return model.isEditable();
    });
  },

  /**
   *
   */
  addToCart: function( product ){
    this.getActiveOrder()
      .then(function(order){
        order.cart.add( product, { parse: true } );
      });
  },

  /**
   * Promise of an active order
   */
  getActiveOrder: function(){
    var self = this;
    var deferred = new $.Deferred();

    if(!this.active){
      this.create().then(function(order){
        self.active = order;
        if(bb.history.getHash() === 'cart/new') {
          bb.history.navigate('cart/' + order.id);
        }
        deferred.resolve(order);
      });
    } else {
      deferred.resolve(this.active);
    }

    return deferred.promise();
  },

  /**
   *
   */
  create: function(){
    var deferred = new $.Deferred();

    // Safari has a problem with create, perhaps an autoincrement problem?
    // Set local_id as timestamp milliseconds
    DualCollection.prototype.create.call(this, {
      local_id: Date.now(),
      status: 'CREATE_FAILED'
    }, {
      wait: true,
      parse: true,
      success: deferred.resolve,
      error: deferred.reject
    });

    return deferred.promise();
  }

});