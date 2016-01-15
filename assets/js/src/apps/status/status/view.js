var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var hbs = require('handlebars');

var View = ItemView.extend({

  attributes: {
    id: 'wc_pos-settings-status'
  },

  initialize: function(){
    this.template = hbs.compile( this.model.template );
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Status.View');