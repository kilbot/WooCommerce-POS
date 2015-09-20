var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var EmulateHTTP = require('lib/behaviors/emulateHTTP');
var $ = require('jquery');

var View = ItemView.extend({

  template: function(){
    return $('script[data-id="tools"]').html();
  },

  attributes: {
    id: 'wc-pos-settings-tools'
  },

  behaviors: {
    EmulateHTTP: {
      behaviorClass: EmulateHTTP
    }
  },

  ui: {
    translation: '*[data-action="translation"]'
  },

  triggers: {
    'click @ui.translation': 'translation:update'
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Tools.View');