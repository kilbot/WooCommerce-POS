// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

// DO NOT include this file in wp-admin
// changes are made to the global $.ajax & bb.sync

var bb = require('backbone');
var Radio = require('backbone.radio');
bb.idbSync = require('./idb/src/sync');
bb.ajaxSync = bb.sync;

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
  // for straight jquery ajax calls
  beforeSend: function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
    var rest_nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'rest_nonce'
    });
    xhr.setRequestHeader('X-WP-Nonce', rest_nonce);
  },
  timeout: 50000 // 50 seconds
});

// global ajax error handler
bb.$( document ).ajaxError(function( event, jqXHR, ajaxSettings, thrownError ) {
  Radio.trigger('global', 'error', {
    jqXHR       : jqXHR,
    thrownError : thrownError
  });
});

// override Backbone.sync
bb.sync = function(method, entity, options) {
  // idb
  if(!options.remote &&
    (entity.db || (entity.collection && entity.collection.db))){
    return bb.idbSync.apply(this, [method, entity, options]);
  }
  // server
  options.beforeSend = function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
    var rest_nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'rest_nonce'
    });
    xhr.setRequestHeader('X-WP-Nonce', rest_nonce);
  };
  // hack to remove status
  if(method === 'create' || method === 'update'){
    entity.unset('status', { silent: true });
  }
  return bb.ajaxSync.apply(this, [method, entity, options]);
};