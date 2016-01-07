var SettingsView = require('lib/config/settings-view');
var $ = require('jquery');
var App = require('lib/config/application');
var CustomerSelect = require('lib/behaviors/customer-select');
var Tooltip = require('lib/behaviors/tooltip');


var View = SettingsView.extend({

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    },
    CustomerSelect: {
      behaviorClass: CustomerSelect
    }
  },

  modelEvents: {
    'change:id': 'render',
    'change:logged_in_user': function(model, toggle){
      this.ui.customerSelect.prop('disabled', toggle);
    }
  },

  ui: {
    customerSelect: 'select[data-select="customer"]'
  },

  onRender: function(){
    var self = this;

    // bind ordinary elements
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });

    // disable customer select if logged_in_user checked
    if( this.model.get('logged_in_user') ){
      this.ui.customerSelect.prop('disabled', true);
    }
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Customers.View');