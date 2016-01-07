var SettingsView = require('lib/config/settings-view');
var App = require('lib/config/application');

var View = SettingsView.extend({

  ui: {
    'previewBtn'  : '[data-action="preview-receipt"]',
    'previewArea' : '#receipt-preview'
  },

  triggers: {
    'click @ui.previewBtn': 'toggle:preview'
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipts.View', View);