// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

var bb = require('backbone');
var ajaxSync = bb.sync;
var idbSync = require('./idb-sync');
var App = require('./application');
var _ = require('lodash');
var Radio = require('backbone.radio');

bb.sync = function(method, entity, options) {
  var promise, idb = _.get(entity, ['collection', 'db'], entity.db);

  if( !options.remote && idb ) {
    promise = idbSync.apply(this, arguments);
  } else {
    App.prototype.ajaxSetup( options );
    promise = ajaxSync.apply(this, arguments);
  }

  promise.catch(function(){
    var args = Array.prototype.slice.call(arguments);
    Radio.trigger('global', 'error', args);
  });

  return promise;
};