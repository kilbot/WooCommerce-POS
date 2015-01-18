var bb = require('backbone');
var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var debug = require('debug')('ordersCollection');
var $ = require('jquery');
var IndexedDB = require('lib/config/indexeddb');

module.exports = DualCollection.extend({
  name: 'orders',
  model: Model,

  comparator: function( model ){
    //var type = model.get( 'type' );
    //if( type === 'fee' ) { return 2; }
    //if( type === 'shipping' ) { return 1; }
    //return 0;
  },

  initialize: function() {

    this.indexedDB = new IndexedDB({
      storeName: 'orders',
      storePrefix: 'wc_pos_',
      dualStorage: true,
      dbVersion: 1,
      keyPath: 'local_id',
      autoIncrement: true,
      indexes: [
        {name: 'local_id', keyPath: 'local_id', unique: true},
        {name: 'id', keyPath: 'id', unique: true},
        {name: 'status', keyPath: 'status', unique: false}
      ]
    }, this);

  },

  fetch: function(options){
    options = options || {};
    var self = this;
    return $.when(this._isReady).then(function() {
      if( options.local ){
        debug('fetching: local orders');
        var promise = $.Deferred();
        self.fetchLocalOrders(promise);
        return promise;
      } else {
        debug('fetching: orders');
        return bb.DualCollection.prototype.fetch.call(self, options);
      }
    });
  },

  fetchLocalOrders: function(promise){
    var self = this;
    var onItem = function(item) {
      if( ! _( item).has('id') ) {
        self.add(item);
      }
    };
    var onEnd = function() {
      promise.resolve();
    };
    self.indexedDB.iterate(onItem, {
      index: 'local_id',
      order: 'ASC',
      onEnd: onEnd
    });
  }

});