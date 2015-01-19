var Service = require('lib/config/service');
var Views = require('./views');
var POS = require('lib/utilities/global');
var $ = require('jquery');

module.exports = POS.HeaderApp = Service.extend({
  channelName: 'header',

  initialize: function() {
    this.start();
  },

  onStart: function(){
    var header = new Views.Header({ el: $('#header') });
    var menu = new Views.Menu({ el: $('#menu') });

    this.channel.comply({
      'open:menu': header.openMenu,
      'close:menu': header.closeMenu
    }, header);
  },

  onStop: function(){
    this.channel.reset();
  }
});
//