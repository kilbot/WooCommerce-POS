// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

var app = require('./application');
var bb = require('backbone');
var _ = require('lodash');

module.exports = function(method, collection, options){

  /**
   * Uses wrapAjaxOptions from ajax config
   * wrap options for auth headers and default error handling
   */
  app.prototype.wrapAjaxOptions( options );

  return bb.sync(method, collection, options)
    .catch(function(resp){

      /**
       * Trigger error for non XHR errors
       */
      if (!_.has(resp, 'getResponseHeader') && _.has(options, 'error')) {
        options.error(resp);
      }
    });
};