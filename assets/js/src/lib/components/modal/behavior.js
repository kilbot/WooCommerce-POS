var Behavior = require('lib/config/behavior');
var Backbone = require('backbone');
var channel = Backbone.Radio.channel('modal');
var POS = require('lib/utilities/global');

module.exports = POS.Behaviors.Modal = Behavior.extend({
  initialize: function () {
    this.listenToOnce(this.view, 'open',  this.openModal);
  },

  openModal: function (callback) {
    channel.command('open', {
      view: this.view,
      callback: callback,
      attributes: this.options
    });

    this.listenToOnce(this.view, 'destroy', this.destroyModal);
  },

  destroyModal: function (callback) {
    channel.command('destroy', {
      callback: callback
    });
  }
});