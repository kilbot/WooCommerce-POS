var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var debug = require('debug')('ordersCollection');
var $ = require('jquery');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = DualCollection.extend({
  model: Model,
  name: 'orders',

  /**
   * Open orders first
   */
  comparator: function( model ){
    if( model.get('id') === undefined ) { return 0; }
    return 1;
  },

  /**
   *
   */
  setActiveOrder: function(id){
    var order = this.get(id);

    if( !order && id !== 'new' ){
      order = _.first( this.openOrders() );
    }

    if( order && !order.isEditable() ){
      Radio.command('router', 'show:receipt', id);
    }

    this.active = order;
    return order;
  },

  /**
   *
   */
  getActiveOrder: function(){
    if(!this.active){
      this.active = this.add({});
    }
    return this.active;
  },

  addToCart: function(options){
    var order = this.getActiveOrder();
    var self = this;
    $.when(order.cart._isReady, order.save({}, {wait:true})).then(function(cart) {
      cart.order_id = order.id;
      cart.addToCart(options);
      if(cart.isNew()){
        self.trigger('new:order', order);
      }
    });
  },

  /**
   *
   */
  openOrders: function(){
    return this.filter(function(model){
      return model.isEditable();
    });
  },

  /**
   * iterate through idb, add orders with no remoteId
   */
  fetchLocal: function(){
    var self = this,
        deferred = $.Deferred();

    var onItem = function(item){
      if(!item.id){
        self.add(item);
      }
    };

    var onEnd = function(){
      self._isNew = false;
      deferred.resolve();
    };

    $.when(this._isReady).then(function() {
      debug('fetching ' + self.name);

      self.indexedDB.iterate(onItem, {
        onEnd: onEnd,
        onError: deferred.reject
      });
    });

    return deferred;
  }

});