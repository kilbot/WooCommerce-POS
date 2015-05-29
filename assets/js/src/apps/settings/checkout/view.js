var FormView = require('lib/config/form-view');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var Tooltip = require('lib/behaviors/tooltip');
var Sortable = require('lib/behaviors/sortable');

var View = FormView.extend({
  template: function(){
    return $('script[data-id="checkout"]').html();
  },

  attributes: {
    id: 'wc-pos-settings-checkout'
  },

  modelEvents: {
    'change:id': 'render'
  },

  onRender: function(){
    var self = this;
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });
    this.modalTmpl = this.$('#tmpl-gateway-settings-modal').html();
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
    this.trigger('open:modal', gateway, this);
  }

});

module.exports = View;
POS.attach('SettingsApp.View');