var Service = require('lib/config/service');
var debug = require('debug')('keyPressService');
var $ = require('jquery');
var _ = require('lodash');
var barcodeParser = require('./barcode');
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

  parsers: [ barcodeParser ],

  addParsers: function(parsers){
    parsers = _.isArray(parsers) ? parsers : [parsers];
    this.parsers = parsers.concat(this.parsers);
    return this.parsers;
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
        self.channel.trigger('scan', buffer);
        self.processScan(buffer);
        self.clearBuffer();
      }, defaults.scanTestDelay);
    }
  },

  processScan: function(keys) {
    debug('scan detected', keys);
    var data = keys.join('');
    this.channel.trigger('scan', data);

    var result = this.parseData(data);
    if(!result){
      debug('no scan parser found', data);
    }
  },

  parseData: function(data){

    for (var i = 0; i < this.parsers.length; i++) {
      var parser = this.parsers[i];
      var parsedData = parser.call(this, data);
      if(parsedData){
        return parsedData;
      }
    }

    // All parsers failed
    return null;
  }
  
});