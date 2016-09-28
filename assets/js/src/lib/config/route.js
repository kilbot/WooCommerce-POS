var bb = require('backbone');
var Mn = require('backbone.marionette');
var _ = require('lodash');
var app = require('./application');
var LoadingService = require('lib/components/loading/service');
var Radio = require('backbone.radio');
var globalChannel = Radio.channel('global');

module.exports = app.prototype.Route = Mn.Object.extend({
  constructor: function (options) {
    this.mergeOptions(options, ['column']);
    this.initialize.apply(this, arguments);
  },

  _triggerMethod: function (name, args) {
    if (this.router) {
      this.router.triggerMethod.apply(
        this.router,
        [name + ':route'].concat(args)
      );
    }
    this.triggerMethod.apply(this, [name].concat(args));
  },

  enter: function (args) {
    var self = this;
    this.transitioning = true;
    this._triggerMethod('before:enter', args);
    this._triggerMethod('before:fetch', args);

    _.delay(function () {
      if (self.transitioning) {
        if(!self.container){
          self.loadingModal = Radio.request('modal', 'loading');
          return;
        }
        self.loading = new LoadingService({
          container: self.container
        });
      }
    }, 100);

    return Promise.resolve()
      .then(function () {
        return self.fetch.call(self, args);
      })
      .then(function () {
        self._triggerMethod('fetch', args);
        self._triggerMethod('before:render', args);
      })
      .then(function () {
        self.transitioning = false;
        if(self.loadingModal){
          Radio.request('modal', 'close', self.loadingModal.$el.data().vex.id);
        }
        return self.render.call(self, args);
      })
      .then(function () {
        self._triggerMethod('render', args);
        self._triggerMethod('enter', args);
      })
      .catch(function (err) {
        Radio.trigger('global', 'error', err);
        self._triggerMethod('error', args);
      });
  },

  navigate: function () {
    bb.history.navigate.apply(bb.history, arguments);
  },

  fetch : function () {},
  render: function () {},

  /**
   * Helper function to set the columned layout tabs
   */
  setTabLabel: function (label) {
    if (this.column) {
      globalChannel.trigger('tab:label', {
        tab  : this.column,
        label: label
      });
    }
  }

});