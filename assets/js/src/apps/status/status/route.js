var Route = require('lib/config/route');
var App = require('lib/config/application');
var View = require('./view');

var Status = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  fetch: function(){

  },

  render: function() {
    var view = new View({ model: this.model });
    this.container.show(view);
  }

});

module.exports = Status;
App.prototype.set('SettingsApp.Status.Route', Status);