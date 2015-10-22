var Service = require('lib/config/service');
var Layout = require('./layout');
//var $ = require('jquery');

module.exports = Service.extend({
  channelName: 'popover',

  initialize: function(){
    this.channel.reply({
      'open' : this.open,
      'close': this.close
    }, this);
  },

  open: function(options){
    if( options.target.data('popoverOpen') ){
      return;
    }

    this.layout = new Layout(options);
    this.layout.open();
    return this.layout;
  },

  close: function(){
    this.layout.close();
  }

});