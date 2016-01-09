var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');

var View = LayoutView.extend({

  template: function(){
    return '' +
      '<div id="wc_pos-settings-section-tabs"></div>' +
      '<div id="wc_pos-settings-section"></div>' +
      '';
  },

  regions: {
    tabs    : '#wc_pos-settings-section-tabs',
    section : '#wc_pos-settings-section'
  },

  attributes: {
    id: 'wc_pos-settings-receipts'
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipts.View', View);