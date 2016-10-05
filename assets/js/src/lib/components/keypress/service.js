var Service = require('lib/config/service');
var debug = require('debug')('keyPressService');
var $ = require('jquery');
var _ = require('lodash');
var timer, buffer = [];

var defaults = {
  scanTestDelay  : 200,
  avgTimePerChar : 40,
  minLength      : 6
};

module.exports = Service.extend({

  channelName: 'keypress',

  initialize: function(options){
    _.defaults(defaults, options);

    // unbind then bind to prevent keypress registering twice
    // $(document).on('keypress.wcpos', listener);
    $(document).unbind('keypress').bind('keypress.wcpos', this.listener.bind(this));
  },

  getBuffer: function(){
    return buffer;
  },

  clearBuffer: function(){
    buffer = [];
  },

  listener: function(e){
    var self = this;
    buffer.push(String.fromCharCode(e.which));

    // first keypress
    if(buffer.length === 1){
      timer = setTimeout(function(){
        if(buffer.length < defaults.minLength){
          self.clearBuffer();
        }
      }, defaults.avgTimePerChar * defaults.minLength);
    }

    // scan detected
    if(buffer.length >= defaults.minLength){
      clearTimeout(timer);
      timer = setTimeout(function(){
        debug('Scan detected', buffer);
        self.channel.trigger('scan', buffer);
        self.processScan(buffer);
        self.clearBuffer();
      }, defaults.scanTestDelay);
    }
  },

  processScan: function(keys) {
    this.channel.trigger('scan:barcode', keys.join(''));
  }


});