// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

var bb = require('backbone');
var ajaxSync = bb.sync;
var idbSync = require('./idb-sync');
var App = require('./application');

bb.sync = function(method, entity, options) {

  // wrap sync errors
  App.prototype.wrapError(options);

  if( !options.remote && entity.db ) {
    return idbSync.apply(this, arguments);
  }

  // add headers, global data etc
  App.prototype.ajaxSetup( options );

  return ajaxSync.apply(this, arguments);
};