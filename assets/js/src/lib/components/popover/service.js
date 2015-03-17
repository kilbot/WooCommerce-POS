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
    if(this.popoverOpen(options.target)){ return; }
    this.layout = new Layout(options);
    this.layout.open();
    return this.layout;
  },

  close: function(){
    this.layout.close();
  },

  popoverOpen: function(target){
    var describedby = target.attr('aria-describedby');
    if(describedby && describedby.slice(0,7) === 'popover'){
      return true;
    }
    return false;
  }

});