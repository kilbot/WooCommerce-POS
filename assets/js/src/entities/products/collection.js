var Backbone = require('backbone');
var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var IndexedDB = require('lib/config/indexeddb');

module.exports = DualCollection.extend({
  name: 'products',
  model: Model,

  initialize: function(){
    this.indexedDB = new IndexedDB({
      storeName: 'products',
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

  loadMore: function(){
    console.log('load more!');
  }

});