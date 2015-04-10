// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

// DO NOT include this file in wp-admin
// changes are made to the global $.ajax & bb.sync

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
  beforeSend: function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
  },
  timeout: 50000 // 50 seconds
});

// global ajax error handler
bb.$( document ).ajaxError(function( event, request ) {
  Radio.trigger('global', 'error', {
    jqXHR   : request,
    status  : request.statusText
    //message : request.responseText
  });
});

// reference to Backbone.sync
bb.ajaxSync = bb.sync;

// sync method for IndexedDB
bb.idbSync = require('./sync/idbsync');

// test for indexedDB
var hasIndexedDB = function(entity){
  if(entity.indexedDB){
    return true;
  }
  if(entity.collection && entity.collection.indexedDB){
    return true;
  }
  return false;
};

// override Backbone.sync
bb.sync = function(method, model, options) {
  // idb
  if(!options.remote && hasIndexedDB(model)){
    return bb.idbSync.apply(this, [method, model, options]);
  }
  // server
  options.beforeSend = function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
  };
  return bb.ajaxSync.apply(this, [method, model, options]);
};