var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var View = require('./view');

var General = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    if(window.wc_pos_settings_general){
      this.model = options.collection.add(window.wc_pos_settings_general);
      this.model.set({id: 'general'});
      this.model._isNew = false;
    } else {
      this.model = options.collection.add({
        id: 'general'
      });
    }
  },

  fetch: function() {
    if(this.model.isNew()){
      return this.model.fetch();
    }
  },

  render: function() {
    var view = new View({
      model: this.model
    });
    this.container.show(view);
  }

});

module.exports = General;
POS.attach('SettingsApp.General.Route', General);