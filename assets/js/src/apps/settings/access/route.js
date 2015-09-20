var Route = require('lib/config/route');
var App = require('lib/config/application');
var View = require('./view');

var Access = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
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

module.exports = Access;
App.prototype.set('SettingsApp.Access.Route', Access);