var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');

var View = LayoutView.extend({

  template: function(){
    return '' +
      '<div id="wc_pos-receipt-template-preview"></div>' +
      '<div id="wc_pos-receipt-template-actions"></div>' +
      '';
  },

  regions: {
    preview : '#wc_pos-receipt-template-preview',
    actions : '#wc_pos-receipt-template-actions'
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipts.Template.View', View);