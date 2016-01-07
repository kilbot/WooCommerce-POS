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
  }

});

module.exports = View;
App.prototype.set('SettingsApp.General.View', View);