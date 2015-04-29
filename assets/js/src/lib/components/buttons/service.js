var Service = require('lib/config/service');
var View = require('./view');

module.exports = Service.extend({

  channelName: 'buttons',

  initialize: function(){

    this.channel.reply({
      'view' : this.view
    }, this);

  },

  view: function(options){
    var view = new View(options);
    return view;
  }

});