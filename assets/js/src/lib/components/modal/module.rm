var Module = require('lib/config/module');
var Backbone = require('backbone');
var modalChannel = Backbone.Radio.channel('modal');
var routerChannel = Backbone.Radio.channel('router');
var LayoutView = require('./layout-view');

module.exports = Module.extend({
  initialize: function () {
    this.container = this.options.container;
    this.start();
  },

  onStart: function() {
    this._showLayoutView();
    this._bindChannelCommands();
  },

  onStop: function() {
    this.stopListening();
  },

  openModal: function (options) {
    this.layout.openModal(options);
    this.listenToOnce(routerChannel, 'route', function () {
      this.destroyModal();
    });
  },

  destroyModal: function (options) {
    this.layout.destroyModal(options);
  },

  _showLayoutView: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
  },

  _bindChannelCommands: function() {
    modalChannel.comply('open', this.openModal, this);
    modalChannel.comply('destroy', this.destroyModal, this);
  }
});