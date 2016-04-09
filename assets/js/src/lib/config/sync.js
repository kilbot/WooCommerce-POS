// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

var bb = require('backbone');
var ajaxSync = bb.sync;
var idbSync = require('./idb-sync');
var App = require('./application');
var _ = require('lodash');

bb.sync = function(method, entity, options) {

  // wrap sync errors
  App.prototype.wrapError(options);

  var idb = _.get(entity, ['collection', 'db'], entity.db);

  if( !options.remote && idb ) {
    return idbSync.apply(this, arguments);
  }

  // add headers, global data etc
  App.prototype.ajaxSetup( options );

  return ajaxSync.apply(this, arguments);
};