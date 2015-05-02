var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
//var Tooltip = require('lib/behaviors/tooltip');
var $ = require('jquery');

var View = ItemView.extend({

  template: function(){
    return $('script[data-id="tools"]').html();
  },

  attributes: {
    id: 'wc-pos-settings-tools'
  },

  //behaviors: {
  //  Tooltip: {
  //    behaviorClass: Tooltip
  //  }
  //},

  ui: {
    translation: '*[data-action="translation"]'
  },

  triggers: {
    'click @ui.translation': 'translation:update'
  }

});

module.exports = View;
POS.attach('SettingsApp.Tools.View');