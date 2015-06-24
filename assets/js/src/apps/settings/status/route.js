var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var View = require('./view');
var Radio = require('backbone.radio');
var $ = require('jquery');

var Status = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;

    this.ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    this.nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });
  },

  fetch: function(){
    var self = this;
    return $.getJSON( this.ajaxurl, {
      action: 'wc_pos_system_status',
      security: this.nonce
    }, function( resp ){
      self.tests = resp;
    });
  },

  render: function() {
    var view = new View({
      tests: this.tests
    });
    this.listenTo( view, {
      'enable:legacy' : this.enableLegacy,
      'disable:legacy': this.disableLegacy
    });
    this.container.show(view);
  },

  enableLegacy: function(){
    this.toggleLegacy(true);
  },

  disableLegacy: function(){
    this.toggleLegacy(false);
  },

  toggleLegacy: function(toggle){
    $.getJSON( this.ajaxurl, {
      action: 'wc_pos_toggle_legacy_server',
      enable: toggle,
      security: this.nonce
    }, function(){
      window.location.reload();
    });
  }

});

module.exports = Status;
POS.attach('SettingsApp.Status.Route', Status);