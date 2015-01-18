var bb = require('backbone');
var POS = require('lib/utilities/global');
var _ = require('lodash');

module.exports = POS.Module = bb.Marionette.Module.extend({
  constructor: function() {
    this.attachGlobals(arguments[0]);
    this.listenTo(bb.history, 'route', this._onHistoryRoute);
    bb.Marionette.Module.apply(this, arguments);
  },

  initialize: function() {},

  _onHistoryRoute: function(router) {
    if (!this.router) {
      return;
    }

    if (this.router && this.router === router) {
      this.start();
    } else {
      this.stop();
    }
  },

  /**
   * attach any POS.POSApp globals before it gets overwritten
   * this is required so third party plugins can access
   * Router, Routes etc
   */
  attachGlobals: function(moduleName){
    if( _(POS).has(moduleName) ){
      _.defaults( this, POS[moduleName] );
    }
  }
});