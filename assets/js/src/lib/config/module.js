var bb = require('backbone');
var POS = require('lib/utilities/global');

module.exports = POS.Module = bb.Marionette.Module.extend({
  constructor: function() {
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
  }
});