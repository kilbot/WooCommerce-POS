var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = POS.Application = Mn.Application.extend({
  _initChannel: function () {
    this.channelName = _.result(this, 'channelName') || 'global';
    this.channel = _.result(this, 'channel') ||
    Radio.channel(this.channelName);
  }
});