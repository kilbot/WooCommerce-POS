var Route = require('lib/config/route');
var App = require('lib/config/application');
var View = require('./view');

var Customers = Route.extend({

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
    var view = new View({ model: this.model });
    this.container.show(view);
  }

});

module.exports = Customers;
App.prototype.set('SettingsApp.Customers.Route', Customers);