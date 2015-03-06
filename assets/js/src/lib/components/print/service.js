var Service = require('lib/config/service');
var hbs = require('handlebars');

module.exports = Service.extend({
  channelName: 'print',

  initialize: function(){
    this.start();
  },

  onStart: function(){
    this.channel.reply({
      'receipt' : this.receipt
    }, this);
  },

  onStop: function(){
    this.channel.reset();
  },

  receipt: function(options){
    options = options || {};

    if(!options.order){
      return;
    }

    var iframe = $('<iframe>')
      .attr('name', 'iframe')
      .css({position:'absolute',top:'-9999px',left:'-9999px',border:'0px'})
      .appendTo('body');

    var template = hbs.compile( $('#tmpl-print-receipt').html() );
    var html = template( options.order.toJSON() );

    frames['iframe'].document.write(html);
    frames['iframe'].focus();
    frames['iframe'].print();
    iframe.remove();
  }

});