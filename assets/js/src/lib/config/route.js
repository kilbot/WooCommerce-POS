var bb = require('backbone');
var Mn = require('backbone.marionette');
var $ = require('jquery');
var _ = require('lodash');
var app = require('./application');
var LoadingService = require('lib/components/loading/service');
var Radio = require('backbone.radio');
var globalChannel = Radio.channel('global');

module.exports = app.prototype.Route = Mn.Object.extend({
  constructor: function( options ) {
    this.mergeOptions( options, ['column'] );
    this.initialize.apply(this, arguments);
  },

  _triggerMethod: function(name, args) {
    if (this.router) {
      this.router.triggerMethod.apply(
        this.router,
        [name + ':route'].concat(args)
      );
    }
    this.triggerMethod.apply(this, [name].concat(args));
  },

  enter: function(args) {
    var self = this;
    this.transitioning = true;
    this._triggerMethod('before:enter', args);
    this._triggerMethod('before:fetch', args);

    _.defer(function() {
      if (self.transitioning) {
        self.loading = new LoadingService({
          container: self.container
        });
      }
    });

    return $.when(this.fetch.call(this, args)).then(function() {
      self._triggerMethod('fetch', args);
      self._triggerMethod('before:render', args);
    }).then(function() {
      self.transitioning = false;
      return self.render.apply(self, args);
    }).then(function() {
      self._triggerMethod('render', args);
      self._triggerMethod('enter', args);
    }).fail(function() {
      self._triggerMethod('error', args);
    });
  },

  navigate: function() {
    bb.history.navigate.apply(bb.history, arguments);
  },

  fetch  : function() {},
  render : function() {},

  /**
   * Helper function to set the columned layout tabs
   */
  setTabLabel: function(label){
    if( this.column ){
      globalChannel.trigger('tab:label', {
        tab   : this.column,
        label : label
      });
    }
  }

});