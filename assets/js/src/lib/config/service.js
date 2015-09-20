var Mn = require('backbone.marionette');
var Radio = require('backbone.radio');
var app = require('./application');
var _ = require('lodash');

module.exports = app.prototype.Service = Mn.Object.extend({
  constructor: function(options) {
    options = options || {};

    if (this.channelName) {
      this.channel = Radio.channel(_.result(this, 'channelName'));
    }

    // add reference to the app, like old Marionette.Module
    if(options.app){
      this.app = options.app;
    }

    Mn.Object.apply(this, arguments);
  },

  start: function(){
    this.triggerMethod('before:start');
    this._isStarted = true;
    this.triggerMethod('start');
  },

  stop: function(){
    this.triggerMethod('before:stop');
    this._isStarted = false;
    this.triggerMethod('stop');
  },

  isStarted: function(){
    return this._isStarted === true;
  }

});