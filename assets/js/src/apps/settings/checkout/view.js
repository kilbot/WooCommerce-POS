var FormView = require('lib/config/form-view');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var Tooltip = require('lib/behaviors/tooltip');
var Sortable = require('lib/behaviors/sortable');

var View = FormView.extend({
  attributes: {
    id: 'wc-pos-settings-checkout'
  },

  initialize: function() {
    var id = this.model.id;
    this.template = function(){
      return $('script[data-id="' + id + '"]').html();
    };
  },

  onRender: function(){
    var self = this;
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });
  },

  ui: {
    settings: '.gateway-settings'
  },

  events: {
    'click @ui.settings': 'openGatewaySettingsModal'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    },
    Sortable: {
      behaviorClass: Sortable
    }
  },

  openGatewaySettingsModal: function(e){
    e.preventDefault();
    var gateway = $(e.target).data('gateway');
    var template = this.$('#tmpl-gateway-settings-modal').html();
    this.trigger('gateway:settings', gateway, template);
  }

});

module.exports = View;
POS.attach('SettingsApp.View');