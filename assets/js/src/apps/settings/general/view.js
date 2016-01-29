var SettingsView = require('lib/config/settings-view');
var App = require('lib/config/application');
var Tooltip = require('lib/behaviors/tooltip');

var View = SettingsView.extend({

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  select2: {
    'discount_quick_keys': {
      maximumSelectionLength: 4
    }
  },

  modelEvents: {
    'change:shipping.taxable': function(model, toggle){
      this.ui.shippingTaxClass.prop('disabled', !toggle);
    },
    'change:fee.taxable': function(model, toggle){
      this.ui.feeTaxClass.prop('disabled', !toggle);
    }
  },

  ui: {
    shippingTaxClass: 'select[name="shipping.tax_class"]',
    feeTaxClass     : 'select[name="fee.tax_class"]'
  },

  onShow: function(){
    if( ! this.model.get('shipping.taxable') ){
      this.ui.shippingTaxClass.prop('disabled', true);
    }
    if( ! this.model.get('fee.taxable') ){
      this.ui.feeTaxClass.prop('disabled', true);
    }
  }

});

module.exports = View;
App.prototype.set('SettingsApp.General.View', View);