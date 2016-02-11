var bb = require('backbone');
var Mn = require('backbone.marionette');
var $ = require('jquery');
var _ = require('lodash');
var Route = require('./route');
var app = require('./application');
var LayoutView = require('./layout-view');

/**
 * Columned layout
 * - fix at two col for now
 */
var ColumnLayout = LayoutView.extend({

  className: 'left-active',

  initialize: function(options){
    this.mergeOptions(options, ['columns']);
  },

  template: function(){
    return '' +
      '<section id="left"></section>' +
      '<section id="right"></section>';
  },

  regions: {
    left: '#left',
    right: '#right'
  }

});

module.exports = app.prototype.Router = Mn.AppRouter.extend({

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

  /**
   *
   */
  execute: function(callback, args) {
    var self = this;

    if (!this.active) {

      // attach layout if columns
      if( this.columns ){
        this.layout = new ColumnLayout({ columns: this.columns });
      }

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