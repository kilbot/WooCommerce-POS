var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var debug = require('debug')('ordersCollection');
var $ = require('jquery');
var IndexedDB = require('lib/config/indexeddb');

module.exports = DualCollection.extend({
  name: 'orders',
  model: Model,

  comparator: function( model ){
    if( model.get('id') === undefined ) { return 0; }
    return 1;
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

  getActiveOrder: function(){
    if(this.active){
      return this.active;
    }
    return this.add({});
  }

});