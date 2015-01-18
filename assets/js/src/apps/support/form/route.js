var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var FormView = require('./view');
var $ = require('jquery');
var bb = require('backbone');
var enititesChannel = bb.Radio.channel('entities');

var FormRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
  },

  fetch: function(){

  },

  render: function(){
    var view = new FormView();

    var ajaxurl = enititesChannel.request('get', {
      type: 'option',
      name: 'ajaxurl'
    });

    this.listenTo( view, 'send:email', function( data ){
      $.post( ajaxurl, {
        action: 'wc_pos_send_support_email',
        payload: data
      });
    });

    this.container.show( view );
  }

});

module.exports = FormRoute;
POS.attach('SupportApp.Form.Route', FormRoute);
