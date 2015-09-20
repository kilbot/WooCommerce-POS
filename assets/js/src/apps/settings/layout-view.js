var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');

var Layout = LayoutView.extend({

  template: function(){
    return '' +
      '<div id="wc-pos-settings-tabs"></div>' +
      '<div id="wc-pos-settings"></div>' +
      '<div id="wc-pos-settings-footer"></div>';
  },

  regions: {
    tabs    : '#wc-pos-settings-tabs',
    settings: '#wc-pos-settings',
    footer  : '#wc-pos-settings-footer'
  }

});

module.exports = Layout;
App.prototype.set('SettingsApp.LayoutView', Layout);