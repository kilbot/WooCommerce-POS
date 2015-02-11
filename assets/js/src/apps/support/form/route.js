var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var FormView = require('./view');
var $ = require('jquery');
var Radio = require('backbone.radio');

var FormRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;

    var label = $('#tmpl-support-form').data('title');
    Radio.command('header', 'update:tab', {id: 'left', label: label});
  },

  fetch: function(){

  },

  render: function(){
    var view = new FormView();

    var ajaxurl = Radio.request('entities', 'get', {
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
