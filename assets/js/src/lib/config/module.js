var bb = require('backbone');
var Mn = require('backbone.marionette');
var app = require('./application');

module.exports = app.prototype.Module = Mn.Module.extend({
  constructor: function() {
    this.listenTo(bb.history, 'route', this._onHistoryRoute);
    Mn.Module.apply(this, arguments);
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