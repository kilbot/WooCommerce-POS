var Service = require('lib/config/service');
var Combokeys = require('combokeys');
var debug = require('debug')('keyPressService');
var $ = require('jquery');
var _ = require('lodash');
var barcodeParser = require('./barcode');
var timer, buffer = [];

var defaults = {
  scanDebounce    : 100,
  keypressTimeout : 40,
  bufferLength    : 12 // note 2 events per key
};

module.exports = Service.extend({

  channelName: 'keypress',

  initialize: function(options){
    _.defaults(defaults, options);

    /**
     * listen to all keypresses
     */
    $(document).on('keypress', this.onKeyEvent.bind(this));
    $(document).on('keydown', this.onKeyEvent.bind(this));
    $(document).on('keyup', this.onKeyEvent.bind(this));

    /**
     * allow hotkey behaviour to register and unregister combo keys
     */
    this.channel.reply({
      register    : this.registerHotkey,
      unregister  : this.unregisterHotkey
    }, this);

    /**
     * init Combokey instance to manage hotkeys, needs a dummy element
     */
    var el = document.createElement('DIV');
    this.combokeys = new Combokeys(el);
  },

  parsers: [ barcodeParser ],

  /**
   * barcodeParser is last
   */
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

  /**
   * onKeyEvent either dump to combokeys or process scan
   */
  onKeyEvent: function(e){
    buffer.push(e);

    // first keypress
    if(buffer.length === 1){
      timer = setTimeout(this.dumpBuffer.bind(this), defaults.keypressTimeout);
    }

    // scan detected
    if(buffer.length >= defaults.bufferLength){
      clearTimeout(timer);
      this.processScan();
    }
  },

  /**
   * dump buffer to combokeys
   */
  dumpBuffer: function(){
    var combokeys = this.combokeys;
    var events = buffer.slice();
    this.clearBuffer();
    _.each(events, function(e){
      combokeys.eventHandler(e);
    });
  },

  /**
   * extract keypress chars and run through parsers
   */
  processScan: _.debounce(function(){
    var keys = _.reduce(buffer, function(keys, e){
      if(e.type === 'keypress'){
        keys.push(String.fromCharCode(e.which));
      }
      return keys;
    }, []);

    this.clearBuffer();

    debug('scan detected', keys);
    var data = keys.join('');
    this.channel.trigger('scan', data);

    var result = this.parseData(data);
    if(!result){
      debug('no scan parser found', data);
    }
  }, defaults.scanDebounce),

  /**
   * parsers will look for patterns
   */
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
  },

  /**
   *
   */
  registerHotkey: function(hotkey, callback){
    this.combokeys.bind(hotkey, callback);
  },

  /**
   *
   */
  unregisterHotkey: function(hotkey){
    this.combokeys.unbind(hotkey);
  }

});