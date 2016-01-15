var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var hbs = require('handlebars');
var EmulateHTTP = require('lib/behaviors/emulateHTTP');

var View = ItemView.extend({

  attributes: {
    id: 'wc_pos-settings-tools'
  },


  behaviors: {
    EmulateHTTP: {
      behaviorClass: EmulateHTTP
    }
  },

  ui: {
    translation : '*[data-action="translation"]',
    deleteData  : '*[data-action="delete-local-data"]'
  },

  triggers: {
    'click @ui.translation'  : 'translation:update',
    'click @ui.deleteData'   : 'data:delete'
  },

  initialize: function(){
    this.template = hbs.compile( this.model.template );
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Tools.View');