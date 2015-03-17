var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
//var Tooltip = require('lib/components/tooltip/behavior');
var $ = require('jquery');

var View = ItemView.extend({
  attributes: {
    id: 'wc-pos-settings-tools'
  },

  initialize: function() {
    this.template = function(){
      return $('script[data-id="tools"]').html();
    };
  },

  //behaviors: {
  //  Tooltip: {
  //    behaviorClass: Tooltip
  //  }
  //},

  ui: {
    translation: '*[data-action="translation"]'
  },

  onRender: function(){

  },

  triggers: {
    'click @ui.translation': 'translation:update'
  }

});

module.exports = View;
POS.attach('SettingsApp.Tools.View');