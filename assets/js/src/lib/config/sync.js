// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

var bb = require('backbone');
var Radio = require('backbone.radio');

// set jquery ajax globals
bb.$.ajaxSetup({
  data: {
    security: function(){
      return Radio.request('entities', 'get', {
        type: 'option',
        name: 'nonce'
      });
    }
  },
  timeout: 50000 // 50 seconds
});

// reference to Backbone.sync
bb.ajaxSync = bb.sync;

// sync method for IndexedDB
bb.idbSync = require('./sync/idbsync');

// override Backbone.sync
bb.sync = function(method, model, options) {
  // idb
  if((model.indexedDB || model.collection.indexedDB) && !options.remote){
    return bb.idbSync.apply(this, [method, model, options]);
  }
  // server
  options.beforeSend = function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
  };
  return bb.ajaxSync.apply(this, [method, model, options]);
};