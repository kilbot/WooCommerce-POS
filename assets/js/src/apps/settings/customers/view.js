var SettingsView = require('lib/config/settings-view');
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
    'change:logged_in_user': function(model, toggle){
      this.ui.customerSelect.prop('disabled', !!toggle);
    }
  },

  ui: {
    customerSelect: 'select[data-select="customer"]'
  },

  onShow: function(){
    // disable customer select if logged_in_user checked
    if( this.model.get('logged_in_user') ){
      this.ui.customerSelect.prop('disabled', true);
    }
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Customers.View');