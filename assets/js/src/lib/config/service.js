var bb = require('backbone');
var POS = require('lib/utilities/global');
var _ = require('lodash');

module.exports = POS.Service = bb.Marionette.Object.extend({
  constructor: function(options) {
    //this.attachGlobals(arguments[0]);

    if (this.channelName) {
      this.channel = bb.Radio.channel(_.result(this, 'channelName'));
    }

    // add reference to the app, like old Marionette.Module
    if(options.app){
      this.app = options.app;
    }

    bb.Marionette.Object.apply(this, arguments);
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

  /**
   * attach any POS.POSApp globals before it gets overwritten
   * this is required so third party plugins can access
   * Router, Routes etc
   */
  //attachGlobals: function(moduleName){
  //  if( _(POS).has(moduleName) ){
  //    _.defaults( this, POS[moduleName] );
  //  }
  //}

});