var bb = require('backbone');
var $ = require('jquery');
var POS = require('lib/utilities/global');

var Route = bb.Marionette.Object.extend({
  constructor: function() {
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
    this._triggerMethod('before:enter', args);
    this._triggerMethod('before:fetch', args);

    return $.when(this.fetch.apply(this, args)).then(function() {
      self._triggerMethod('fetch', args);
      self._triggerMethod('before:render', args);
    }).then(function() {
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
  render : function() {}
});

module.exports = Route;
POS.attach('Route', Route);