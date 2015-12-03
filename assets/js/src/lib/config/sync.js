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
  },
  // remove comments, eg: WP Super Cache
  //dataFilter: function(data, type){
  //  if( type === 'json' ){
  //    return data.replace(/<!--[\s\S]*?-->/g, '');
  //  }
  //  return data;
  //},
  timeout: 50000 // 50 seconds,
});

// override Backbone.sync
bb.sync = function(method, entity, options) {

  // wrap sync errors, kick to error modal
  var onError = options.error;
  options.error = function( xhr, textStatus, errorThrown ){
    Radio.trigger('global', 'error', {
      xhr: xhr,
      statusText: textStatus,
      thrownError: errorThrown
    });
    if(onError) {
      onError.call(options.context, xhr, textStatus, errorThrown);
    }
  };

  // idb
  if(!options.remote &&
    (entity.db || (entity.collection && entity.collection.db))){
    return bb.idbSync.apply(this, [method, entity, options]);
  }
  // server
  options.beforeSend = function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
  };
  return bb.ajaxSync.apply(this, [method, entity, options]);
};