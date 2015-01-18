var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var StatusView = require('./view');
var $ = require('jquery');
var bb = require('backbone');
var enititesChannel = bb.Radio.channel('entities');

var StatusRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
  },

  fetch: function(){
    var ajaxurl = enititesChannel.request('get', {
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
POS.attach('SupportApp.Form.Status', StatusRoute);