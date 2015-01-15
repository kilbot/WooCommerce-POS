var Backbone = require('backbone');
var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');

module.exports = DualCollection.extend({
  name: 'orders',
  model: Model,

  initialize: function( models, options ) {
    this.indexedDB = new Backbone.IndexedDB({
      storeName: 'orders',
      storePrefix: 'wc_pos_',
      dualStorage: true,
      dbVersion: 1,
      keyPath: 'local_id',
      autoIncrement: true,
      indexes: [
        {name: 'local_id', keyPath: 'local_id', unique: true},  // same as idAttribute
        {name: 'id', keyPath: 'id', unique: true},  // same as remoteIdAttribute
        {name: 'status', keyPath: 'status', unique: false}  // required
      ]
    }, this);
  },

  fetchLocalOrders: function(){
    var self = this;
    var onItem = function(item) {
      if( ! _( item).has('id') ) {
        self.add(item);
      }
    };
    var onEnd = function() {
      self.trigger('orders:ready');
    };
    self.indexedDB.iterate(onItem, {
      index: 'local_id',
      order: 'ASC',
      onEnd: onEnd
    });
  }

});