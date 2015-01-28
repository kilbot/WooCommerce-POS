var LayoutView = require('lib/config/layout-view');
var POS = require('lib/utilities/global');

var Layout = LayoutView.extend({

  template: function(){
    return '' +
      '<div id="wc-pos-settings-tabs"></div>' +
      '<div id="wc-pos-settings"></div>';
  },

  regions: {
    tabsRegion: '#wc-pos-settings-tabs',
    settingsRegion: '#wc-pos-settings'
  }

});

module.exports = Layout;
POS.attach('SettingsApp.LayoutView', Layout);