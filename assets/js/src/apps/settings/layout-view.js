var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');

var Layout = LayoutView.extend({

  template: function(){
    return '' +
      '<div id="wc_pos-settings-tabs"></div>' +
      '<div id="wc_pos-settings"></div>' +
      '<div id="wc_pos-settings-footer"></div>';
  },

  regions: {
    tabs    : '#wc_pos-settings-tabs',
    settings: '#wc_pos-settings',
    footer  : '#wc_pos-settings-footer'
  }

});

module.exports = Layout;
App.prototype.set('SettingsApp.LayoutView', Layout);