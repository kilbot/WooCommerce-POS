var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var StatusView = require('./view');
var $ = require('jquery');
var Radio = require('backbone.radio');

var StatusRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;

    var label = $('#tmpl-pos-status').data('title');
    Radio.command('header', 'update:tab', {id: 'right', label: label});
  },

  fetch: function(){
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
    this.results = $.get( ajaxurl, {
      action: 'wc_pos_system_status'
    });
    return this.results;
  },

  render: function(){
    var view = new StatusView(this.results);
    this.container.show(view);
  }

});

module.exports = StatusRoute;
POS.attach('SupportApp.Status.Route', StatusRoute);