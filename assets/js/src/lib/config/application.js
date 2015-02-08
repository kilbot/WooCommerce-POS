var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');

module.exports = POS.Application = Mn.Application.extend({
  _initChannel: function () {
    this.channelName = _.result(this, 'channelName') || 'global';
    this.channel = _.result(this, 'channel') ||
    Radio.channel(this.channelName);
  }
});