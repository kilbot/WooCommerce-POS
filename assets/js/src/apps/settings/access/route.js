var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var View = require('./view');

var Access = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.collection.add(window.wc_pos_settings_access);
    this.model.set({id: 'access'});
    this.model._isNew = false;
  },

  render: function() {
    var view = new View({
      model: this.model
    });
    this.container.show(view);
  }

});

module.exports = Access;
POS.attach('SettingsApp.Access.Route', Access);