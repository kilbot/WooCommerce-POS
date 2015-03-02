var Service = require('lib/config/service');
var globalChannel = require('backbone.radio').channel('global');

module.exports = Service.extend({
  channelName: 'logger',

  initialize: function(){
    this.start();
  },

  onStart: function(){
    globalChannel.on({
      'error'   : this.error
    }, this);
  },

  onStop: function(){
    this.channel.reset();
  },

  /**
   * eg: jqXHR.fail
   */
  error: function(options){
    console.log(options);
  }

});