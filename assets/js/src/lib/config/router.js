var bb = require('backbone');
var Mn = require('backbone.marionette');
var $ = require('jquery');
var _ = require('lodash');
var Route = require('./route');
var POS = require('lib/utilities/global');

module.exports = POS.Router = Mn.AppRouter.extend({
  constructor: function() {
    this.channel = bb.Radio.channel('router');
    this.on('all', this._onRouterEvent);
    this.listenTo(bb.history, 'route', this._onHistoryRoute);
    Mn.AppRouter.apply(this, arguments);
  },

  _onRouterEvent: function(name) {
    var args = _.toArray(arguments).slice(1);
    this.channel.trigger.apply(this.channel, [name, this].concat(args));
  },

  _onHistoryRoute: function(router) {
    if (this === router) {
      this.active = true;
    } else {
      this.active = false;
      this._currentRoute = undefined;
    }
  },

  execute: function(callback, args) {
    var self = this;

    if (!this.active) {
      this.triggerMethod.apply(this, ['before:enter'].concat(args));
    }

    this.triggerMethod.apply(this, ['before:route'].concat(args));

    $.when(this._execute(callback, args)).then(function() {
      if (!self.active) {
        self.triggerMethod.apply(self, ['enter'].concat(args));
      }

      self.triggerMethod.apply(self, ['route'].concat(args));
    });
  },

  _execute: function(callback, args) {
    var route = callback.apply(this, args);
    this._currentRoute = route;

    if (route instanceof Route) {
      route.router = this;
      return route.enter(args);
    }
  },

  triggerMethod: Mn.triggerMethod
});